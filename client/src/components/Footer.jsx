import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ArrowRight,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../public/images/whitelogo.png";

export default function Footer() {
  const footerLinks = {
    platform: [
      { name: "Browse Courses", href: "/courses" },
      { name: "Live Classrooms", href: "/classrooms" },
      { name: "Our Instructors", href: "/about" },
      { name: "Success Stories", href: "/#testimonials" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "#" },
      { name: "Blog", href: "#" },
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "FAQ", href: "/#faq" },
    ],
  };

  const socialLinks = [
    { icon: <Facebook className="w-4 h-4" />, href: "#", label: "Facebook" },
    { icon: <Twitter className="w-4 h-4" />, href: "#", label: "Twitter" },
    { icon: <Linkedin className="w-4 h-4" />, href: "#", label: "LinkedIn" },
    { icon: <Instagram className="w-4 h-4" />, href: "#", label: "Instagram" },
    { icon: <Youtube className="w-4 h-4" />, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Main Footer */}
      <div className="bg-gray-900 pt-16 pb-8 px-4 sm:px-6">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <img className="w-14" src={Logo} alt="Academiq" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
                Empowering learners worldwide with quality education. Join
                millions of students transforming their careers through our
                platform.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <a
                  href="mailto:hello@academiq.com"
                  className="flex items-center gap-3 text-gray-400 hover:text-orange-400 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm">hello@academiq.com</span>
                </a>
                <a
                  href="tel:+919811323209"
                  className="flex items-center gap-3 text-gray-400 hover:text-orange-400 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm">+91 98113 23 2309</span>
                </a>
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Somewhere in the World</span>
                </div>
              </div>
            </div>

            {/* Links Grid */}
            <div>
              <h4 className="font-semibold text-white mb-5 flex items-center gap-2">
                Platform
                <div className="w-8 h-[2px] bg-gradient-to-r from-orange-500 to-transparent" />
              </h4>
              <ul className="space-y-3">
                {footerLinks.platform.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-5 flex items-center gap-2">
                Company
                <div className="w-8 h-[2px] bg-gradient-to-r from-orange-500 to-transparent" />
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-5 flex items-center gap-2">
                Support
                <div className="w-8 h-[2px] bg-gradient-to-r from-orange-500 to-transparent" />
              </h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-orange-400 transition-colors text-sm flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-white font-semibold mb-1">
                  Subscribe to our Newsletter
                </h4>
                <p className="text-gray-400 text-sm">
                  Get the latest courses and updates delivered to your inbox.
                </p>
              </div>
              <div className="flex w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 bg-gray-800 text-white rounded-l-xl border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm w-full md:w-64"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-r-xl hover:from-orange-600 hover:to-red-600 transition-all whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm flex items-center gap-1">
              © {new Date().getFullYear()} Academiq. Made with
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              for learners
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-orange-500 hover:to-red-500 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
