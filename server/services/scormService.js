import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

class ScormService {
  constructor() {
    this.supportedVersions = ['1.2', '2004'];
  }

  async processScormPackage(zipPath, extractPath) {
    try {
      // Extract ZIP file
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);

      // Find and parse imsmanifest.xml
      const manifestPath = path.join(extractPath, 'imsmanifest.xml');
      if (!fs.existsSync(manifestPath)) {
        throw new Error('imsmanifest.xml not found in SCORM package');
      }

      const manifestXml = fs.readFileSync(manifestPath, 'utf8');
      const manifest = await parseXML(manifestXml);

      // Detect SCORM version
      const version = this.detectScormVersion(manifest);
      if (!this.supportedVersions.includes(version)) {
        throw new Error(`Unsupported SCORM version: ${version}`);
      }

      // Parse based on version
      const scormData = version === '1.2' 
        ? this.parseScorm12(manifest, extractPath)
        : this.parseScorm2004(manifest, extractPath);

      return {
        version,
        manifest,
        ...scormData
      };
    } catch (error) {
      throw new Error(`Failed to process SCORM package: ${error.message}`);
    }
  }

  detectScormVersion(manifest) {
    const metadata = manifest.manifest?.metadata?.[0];
    
    // Check schema version
    if (metadata?.schemaversion) {
      const schemaVersion = metadata.schemaversion[0];
      if (schemaVersion.includes('1.2')) return '1.2';
      if (schemaVersion.includes('2004') || schemaVersion.includes('4th')) return '2004';
    }

    // Check CAM schema version
    if (metadata?.['adlcp:location']) {
      const location = metadata['adlcp:location'][0];
      if (location.includes('CAM_v1_3') || location.includes('2004')) return '2004';
      if (location.includes('CAM_v1_2') || location.includes('1.2')) return '1.2';
    }

    // Check namespace attributes
    const manifestNode = manifest.manifest?.$;
    if (manifestNode) {
      const xmlns = manifestNode.xmlns || '';
      const xmlnsAdlcp = manifestNode['xmlns:adlcp'] || '';
      const xmlnsAdlseq = manifestNode['xmlns:adlseq'] || '';
      
      // SCORM 2004 specific namespaces
      if (xmlnsAdlcp.includes('adlcp_v1p3') || 
          xmlnsAdlseq.includes('adlseq_v1p3') ||
          xmlns.includes('imscp_v1p1') && xmlnsAdlcp.includes('adlcp')) {
        return '2004';
      }
      
      // SCORM 1.2 namespace
      if (xmlns.includes('imscp_v1p1') && !xmlnsAdlcp.includes('adlcp')) {
        return '1.2';
      }
    }

    // Check resource scorm types
    const resources = manifest.manifest?.resources?.[0]?.resource || [];
    const hasScorm2004Types = resources.some(r => 
      r.$['adlcp:scormtype'] === 'sco' || r.$['adlcp:scormtype'] === 'asset'
    );
    
    if (hasScorm2004Types) {
      return '2004';
    }

    // Default to 1.2 if cannot detect
    return '1.2';
  }

  parseScorm12(manifest, extractPath) {
    const manifestData = manifest.manifest;
    
    // Get basic info
    const title = this.getTitle(manifestData);
    const description = this.getDescription(manifestData);
    
    // Parse organizations
    const organizations = this.parseOrganizations12(manifestData.organizations?.[0]);
    
    // Parse resources
    const resources = this.parseResources12(manifestData.resources?.[0]);
    
    // Find launch URL
    const launchUrl = this.findLaunchUrl(organizations, resources, extractPath);

    return {
      title,
      description,
      launchUrl,
      scorm12: {
        organizations,
        resources
      }
    };
  }

  parseScorm2004(manifest, extractPath) {
    const manifestData = manifest.manifest;
    
    // Get basic info
    const title = this.getTitle(manifestData);
    const description = this.getDescription(manifestData);
    
    // Parse organizations
    const organizations = this.parseOrganizations2004(manifestData.organizations?.[0]);
    
    // Parse resources
    const resources = this.parseResources2004(manifestData.resources?.[0]);
    
    // Find launch URL
    const launchUrl = this.findLaunchUrl(organizations, resources, extractPath);

    return {
      title,
      description,
      launchUrl,
      scorm2004: {
        organizations,
        resources,
        sequencingCollection: manifestData.sequencingCollection || null,
        navigationInterface: manifestData.navigationInterface || null
      }
    };
  }

  parseOrganizations12(orgsData) {
    if (!orgsData?.organization) return [];
    
    return orgsData.organization.map(org => ({
      identifier: org.$.identifier,
      title: this.extractText(org.title),
      items: this.parseItems12(org.item || [])
    }));
  }

  parseOrganizations2004(orgsData) {
    if (!orgsData?.organization) return [];
    
    return orgsData.organization.map(org => ({
      identifier: org.$.identifier,
      title: this.extractText(org.title),
      structure: org.$.structure || 'hierarchical',
      items: this.parseItems2004(org.item || [])
    }));
  }

  parseItems12(items) {
    return items.map(item => ({
      identifier: item.$.identifier,
      title: this.extractText(item.title),
      resource: item.$.identifierref,
      parameters: item.$.parameters,
      dataFromLMS: item.$.datafromlms,
      timeLimitAction: item.$.timelimitaction,
      completionThreshold: item.$.completionthreshold,
      masteryScore: item.$.masteryscore
    }));
  }

  parseItems2004(items) {
    return items.map(item => ({
      identifier: item.$.identifier,
      title: this.extractText(item.title),
      resource: item.$.identifierref,
      parameters: item.$.parameters,
      dataFromLMS: item.$.datafromlms,
      timeLimitAction: item.$.timelimitaction,
      completionThreshold: item.$.completionthreshold,
      masteryScore: item.$.masteryscore,
      sequencing: item.sequencing?.[0] || null,
      navigation: item.navigation?.[0] || null
    }));
  }

  parseResources12(resourcesData) {
    if (!resourcesData?.resource) return [];
    
    return resourcesData.resource.map(resource => ({
      identifier: resource.$.identifier,
      type: resource.$.type,
      href: resource.$.href,
      files: resource.file?.map(f => f.$.href) || [],
      dependencies: resource.dependency?.map(d => d.$.identifierref) || []
    }));
  }

  parseResources2004(resourcesData) {
    if (!resourcesData?.resource) return [];
    
    return resourcesData.resource.map(resource => ({
      identifier: resource.$.identifier,
      type: resource.$.type,
      href: resource.$.href,
      scormType: resource.$['adlcp:scormtype'],
      files: resource.file?.map(f => f.$.href) || [],
      dependencies: resource.dependency?.map(d => d.$.identifierref) || []
    }));
  }

  findLaunchUrl(organizations, resources, extractPath) {
    // Find the first launchable resource
    const firstOrg = organizations[0];
    if (!firstOrg?.items?.length) return '';
    
    const firstItem = firstOrg.items[0];
    const resource = resources.find(r => r.identifier === firstItem.resource);
    
    if (!resource?.href) return '';
    
    // Return relative path from extract directory
    return resource.href;
  }

  getTitle(manifestData) {
    return this.extractText(manifestData.metadata?.[0]?.lom?.[0]?.general?.[0]?.title) ||
           this.extractText(manifestData.organizations?.[0]?.organization?.[0]?.title) ||
           'SCORM Package';
  }

  getDescription(manifestData) {
    return this.extractText(manifestData.metadata?.[0]?.lom?.[0]?.general?.[0]?.description) || '';
  }

  extractText(textNode) {
    if (!textNode) return '';
    if (typeof textNode === 'string') return textNode;
    if (Array.isArray(textNode)) return textNode[0] || '';
    if (textNode.langstring) return textNode.langstring[0]._ || textNode.langstring[0];
    return textNode._ || textNode;
  }

  generateScormResponse(scormData, version) {
    // Clean and serialize data properly
    const cleanData = JSON.parse(JSON.stringify({
      version,
      title: scormData.title,
      description: scormData.description,
      launchUrl: scormData.launchUrl,
      packageUrl: scormData.packageUrl,
      manifest: scormData.manifest
    }));

    if (version === '1.2') {
      cleanData.scorm12 = {
        organizations: JSON.parse(JSON.stringify(scormData.scorm12?.organizations || [])),
        resources: JSON.parse(JSON.stringify(scormData.scorm12?.resources || []))
      };
    } else {
      cleanData.scorm2004 = {
        organizations: JSON.parse(JSON.stringify(scormData.scorm2004?.organizations || [])),
        resources: JSON.parse(JSON.stringify(scormData.scorm2004?.resources || [])),
        sequencingCollection: scormData.scorm2004?.sequencingCollection || null,
        navigationInterface: scormData.scorm2004?.navigationInterface || null
      };
    }

    return cleanData;
  }
}

export default new ScormService();
