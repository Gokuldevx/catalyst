import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const AboutUs = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <>
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              to="/"
              className="text-2xl font-extrabold text-primary tracking-tight hover:opacity-80 transition-opacity"
            >
              Catalyst
            </Link>
            <div className="flex gap-4 items-center">
              <Button
                className="text-white shadow-lg 
                                bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700
                                transform transition-all duration-300 ease-in-out
                                hover:scale-105 hover:shadow-xl
                                active:scale-95 active:shadow-md"
                onClick={handleBack}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <Card className="border-none shadow-xl">
        <CardHeader className="border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              About Us
            </h1>
          </div>
        </CardHeader>
        <br />
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="gap-4">
              <div className="space-y-2">
                <p className="text-gray-600">
                  Catalyst is a platform connecting startup founders with
                  skilled technical co-founders, fostering collaborative
                  relationships that drive innovation and growth. The platform
                  enables founders to showcase their startup ideas, discover and
                  connect with talented developers, and collaborate seamlessly.
                  Developers can highlight their skills, specify partnership
                  preferences, and apply to startup projects. Catalyst's
                  decentralized architecture ensures secure data management,
                  while its user-centric design streamlines the collaboration
                  process.
                </p>
              </div>
            </div>

            <div className="gap-4">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    Key Features
                  </h2>
                </div>

                <p className="text-gray-600">
                  For Founders:
                  <br />
                  1. Detailed Profiles: Create comprehensive profiles showcasing
                  startup ideas, goals, and requirements.
                  <br />
                  2. Developer Portfolio Review: Review developer portfolios,
                  including GitHub repositories and other relevant work samples.
                  <br />
                  3. Application Management: Receive, review, and manage
                  applications from interested developers.
                  <br />
                  4. Secure Communication: Exchange contact information with
                  matched developers, facilitating seamless collaboration.
                  <br />
                  <br />
                  For Developers:
                  <br />
                  1. Skill Showcase: Create profiles highlighting technical
                  skills, expertise, and experience.
                  <br />
                  2. Startup Discovery: Browse and discover startup projects
                  aligning with skills and interests.
                  <br />
                  3. Application Submission: Apply to startup projects,
                  showcasing relevant skills and experience.
                  <br />
                  4. Collaboration: Collaborate directly with startup founders,
                  driving innovation and growth.
                  <br />
                  5. Storage: Store sensitive credentials such as API keys,
                  Passwords, API Secrets, etc.
                  <br />
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AboutUs;
