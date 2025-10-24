import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';
import Logo from '../public/images/whitelogo.png';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-xs sm:text-sm text-gray-700">
        {/* Logo + Contact Info */}
        <div className="space-y-4">
          <div className="p-2 inline-block rounded">
            <img className='w-12 sm:w-16' src={Logo} alt="" />
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>hello@academiq.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>+91 98113 23 2309</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Somewhere in the World</span>
          </div>
        </div>

        {/* Home Links */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Home</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                Benefits
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Our Courses
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Our Testimonials
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Our FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* About Us */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">About Us</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                Company
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Achievements
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Our Goals
              </a>
            </li>
          </ul>
        </div>

        {/* Social Profiles */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Social Profiles</h4>
          <div className="flex gap-3">
            <a href="#" className="bg-gray-100 p-2 rounded hover:bg-gray-200">
              <Facebook className="w-4 h-4 text-gray-700" />
            </a>
            <a href="#" className="bg-gray-100 p-2 rounded hover:bg-gray-200">
              <Twitter className="w-4 h-4 text-gray-700" />
            </a>
            <a href="#" className="bg-gray-100 p-2 rounded hover:bg-gray-200">
              <Linkedin className="w-4 h-4 text-gray-700" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-gray-500 text-xs mt-6 sm:mt-10 border-t border-gray-100 pt-4 sm:pt-6">
        © 2023 Academiq. All rights reserved.
      </div>
    </footer>
  );
}
