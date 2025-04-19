import { UserCircle, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[hsl(222.2,47.4%,11.2%)] text-white py-12 mt-auto mt-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Catalyst Section */}
          <div className="space-y-6">
            <Link to="/" className="block">
              <h2 className="text-3xl font-bold text-primary-foreground">Catalyst</h2>
            </Link>
            <p className="text-gray-300 text-lg">
              Connecting innovative founders with exceptional talent to build the future of technology.
            </p>
            <p className="text-gray-300">
              Join our platform to discover opportunities that match your skills and aspirations, or find the perfect talent to grow your startup.
            </p><br/>
            <Link to="/about" className="block text-gray-300 hover:text-white transition-colors">
                  About Us
            </Link>
          </div>

          {/* Navigation Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Candidate Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-6">
                <UserCircle className="w-6 h-6 text-primary-foreground" />
                <h3 className="text-xl font-semibold text-primary-foreground">For Developers</h3>
              </div>
              <nav className="space-y-3">
                <Link to="/overview" className="block text-gray-300 hover:text-white transition-colors">
                  Overview
                </Link>
                <Link to="/startup-projects" className="block text-gray-300 hover:text-white transition-colors">
                  Startup Projects
                </Link>
                <Link to="/web3-projects" className="block text-gray-300 hover:text-white transition-colors">
                  Web3 Projects
                </Link>
                <Link to="/secure" className="block text-gray-300 hover:text-white transition-colors">
                  Secure Sensitive Credentials
                </Link>
                <Link to="/tech-startups" className="block text-gray-300 hover:text-white transition-colors">
                  Tech Startups
                </Link>
              </nav>
            </div>

            {/* Recruiter Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-6">
                <Building2 className="w-6 h-6 text-primary-foreground" />
                <h3 className="text-xl font-semibold text-primary-foreground">For Founders</h3>
              </div>
              <nav className="space-y-3">
                <Link to="/recruiter/overview" className="block text-gray-300 hover:text-white transition-colors">
                  Overview
                </Link>
                <Link to="/recruiter/ideas" className="block text-gray-300 hover:text-white transition-colors">
                  Showcase ideas
                </Link>
                <Link to="/recruiter/find-developers" className="block text-gray-300 hover:text-white transition-colors">
                  Find Developers
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p> {new Date().getFullYear()} Catalyst. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
