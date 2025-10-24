import multer from "multer";
import path from "path";
import fs from "fs";

let scormService = null;

// Load SCORM service asynchronously
(async () => {
  try {
    console.log("Loading SCORM service...");
    const scormModule = await import("../services/scormService.js");
    scormService = scormModule.default;
    console.log("SCORM service loaded successfully");
  } catch (error) {
    console.error("Failed to load SCORM service:", error.message);
    scormService = null;
  }
})();

// Ensure upload directories exist
const videoUploadDir = "uploads/videos/";
const scormUploadDir = "uploads/scorm/";
const assignmentUploadDir = "uploads/assignments/";
const resourceUploadDir = "uploads/resources/";
const documentUploadDir = "uploads/documents/";
if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}
if (!fs.existsSync(scormUploadDir)) {
  fs.mkdirSync(scormUploadDir, { recursive: true });
}
if (!fs.existsSync(assignmentUploadDir)) {
  fs.mkdirSync(assignmentUploadDir, { recursive: true });
}
if (!fs.existsSync(resourceUploadDir)) {
  fs.mkdirSync(resourceUploadDir, { recursive: true });
}
if (!fs.existsSync(documentUploadDir)) {
  fs.mkdirSync(documentUploadDir, { recursive: true });
}

// Configure multer for video uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoUploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const userId = req.user?.id || "unknown";
    const lessonId = req.body.lessonId || "lesson";
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `videos_${lessonId}_${userId}_${timestamp}_${cleanName}`);
  },
});

// Configure multer for SCORM uploads
const scormStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, scormUploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const userId = req.user?.id || "unknown";
    const lessonId = req.body.lessonId || "lesson";
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `scorm_${lessonId}_${userId}_${timestamp}_${cleanName}`);
  },
});

// Configure multer for assignment resources
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, assignmentUploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const userId = req.user?.id || "unknown";
    const lessonId = req.body.lessonId || "lesson";
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `assignments_${lessonId}_${userId}_${timestamp}_${cleanName}`);
  },
});

// Configure multer for general resources
const resourceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resourceUploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const userId = req.user?.id || "unknown";
    const lessonId = req.body.lessonId || "lesson";
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `resources_${lessonId}_${userId}_${timestamp}_${cleanName}`);
  },
});

// Configure multer for document uploads
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentUploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const userId = req.user?.id || "unknown";
    const lessonId = req.body.lessonId || "lesson";
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `documents_${lessonId}_${userId}_${timestamp}_${cleanName}`);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
});

const scormUpload = multer({
  storage: scormStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for SCORM packages
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/zip" ||
      file.originalname.toLowerCase().endsWith(".zip")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only ZIP files are allowed"));
    }
  },
});

const assignmentUpload = multer({
  storage: assignmentStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for assignment files
  },
});

const resourceUpload = multer({
  storage: resourceStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for resource files
  },
});

const documentUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for document files
  },
  fileFilter: (req, file, cb) => {
    // Allow common document formats
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only document files (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT) are allowed"
        )
      );
    }
  },
});

export const uploadVideo = (req, res) => {
  console.log("Video upload request received");
  console.log("User:", req.user?.email);
  console.log("Content-Type:", req.headers["content-type"]);

  videoUpload.single("video")(req, res, (err) => {
    if (err) {
      console.error("Multer upload error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      console.log("File received:", req.file ? "Yes" : "No");
      if (req.file) {
        console.log("File details:", {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        });
      }

      if (!req.file) {
        console.log("No file in request");
        return res.status(400).json({ error: "No video file uploaded" });
      }

      const videoUrl = `${req.protocol}://${req.get("host")}/uploads/videos/${
        req.file.filename
      }`;
      console.log("Generated video URL:", videoUrl);

      res.json({
        videoUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Upload failed", details: error.message });
    }
  });
};

export const uploadScorm = (req, res) => {
  console.log("=== SCORM UPLOAD REQUEST START ===");
  console.log("Request received at:", new Date().toISOString());
  console.log("User:", req.user?.email);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Content-Length:", req.headers["content-length"]);

  if (!scormService) {
    console.error("SCORM service not available!");
    return res.status(500).json({ error: "SCORM service not available" });
  }

  console.log("SCORM service available, processing upload...");
  console.log("Upload directory exists:", fs.existsSync(scormUploadDir));
  console.log("Upload directory path:", scormUploadDir);

  scormUpload.single("scorm")(req, res, async (err) => {
    if (err) {
      console.error("Multer SCORM upload error:", err);
      console.error("Error type:", err.constructor.name);
      console.error("Error code:", err.code);
      return res.status(400).json({ error: err.message });
    }

    try {
      console.log("File processing - req.file exists:", !!req.file);

      if (!req.file) {
        console.error("No file received in request");
        return res.status(400).json({ error: "No SCORM package uploaded" });
      }

      console.log("SCORM file details:", {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      });

      // Create extraction directory
      const extractDir = path.join(
        scormUploadDir,
        path.parse(req.file.filename).name
      );
      console.log("Extract directory:", extractDir);

      if (!fs.existsSync(extractDir)) {
        console.log("Creating extract directory...");
        fs.mkdirSync(extractDir, { recursive: true });
      }

      console.log("Processing SCORM package...");
      // Add small delay to ensure file operations complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Process SCORM package
      const scormData = await scormService.processScormPackage(
        req.file.path,
        extractDir
      );
      console.log(
        "SCORM data processed - version:",
        scormData.version,
        "title:",
        scormData.title
      );

      // Generate package URL
      const packageUrl = `${req.protocol}://${req.get("host")}/uploads/scorm/${
        path.parse(req.file.filename).name
      }`;
      console.log("Package URL:", packageUrl);

      // Generate launch URL
      const launchUrl = `${packageUrl}/${scormData.launchUrl}`;
      console.log("Launch URL:", launchUrl);

      // Return essential SCORM data without complex arrays
      const response = {
        version: scormData.version,
        title: scormData.title,
        description: scormData.description,
        launchUrl,
        packageUrl,
      };

      console.log("SCORM processing successful, sending response");
      console.log("=== SCORM UPLOAD REQUEST END ===");
      res.json(response);
    } catch (error) {
      console.error("SCORM processing error:", error);
      console.error("Error stack:", error.stack);
      console.log("=== SCORM UPLOAD REQUEST FAILED ===");
      res.status(500).json({ error: error.message });
    }
  });
};

export const uploadAssignmentFile = (req, res) => {
  console.log("Assignment file upload request received");
  console.log("User:", req.user?.email);

  assignmentUpload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Assignment file upload error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `${req.protocol}://${req.get(
        "host"
      )}/uploads/assignments/${req.file.filename}`;

      res.json({
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Upload failed", details: error.message });
    }
  });
};

export const uploadResourceFile = (req, res) => {
  console.log("Resource file upload request received");
  console.log("User:", req.user?.email);

  resourceUpload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Resource file upload error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/resources/${
        req.file.filename
      }`;

      res.json({
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Upload failed", details: error.message });
    }
  });
};

export const uploadDocument = (req, res) => {
  console.log("Document upload request received");
  console.log("User:", req.user?.email);

  documentUpload.single("document")(req, res, (err) => {
    if (err) {
      console.error("Document upload error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No document uploaded" });
      }

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/documents/${
        req.file.filename
      }`;

      res.json({
        fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Upload failed", details: error.message });
    }
  });
};
