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
                <p className="text-black-600">
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

                <p className="text-black-600">
                  <b>For Founders:</b>
                  <br />
                  <ul className="list-disc ml-4">
                    <li>
                      Detailed Profiles: Create comprehensive profiles
                      showcasing startup ideas, goals, and requirements.
                    </li>
                    <li>
                      Developer Portfolio Review: Review developer portfolios,
                      including GitHub repositories and other relevant work
                      samples.
                    </li>
                    <li>
                      Application Management: Receive, review, and manage
                      applications from interested developers.
                    </li>
                    <li>
                      Secure Communication: Exchange contact information with
                      matched developers, facilitating seamless collaboration.
                    </li>
                  </ul>
                  <br />

                  <b>For Developers:</b>
                  <ul className="list-disc ml-4">
                    <li>
                      Skill Showcase: Create profiles highlighting technical
                      skills, expertise, and experience.
                    </li>
                    <li>
                      Startup Discovery: Browse and discover startup projects
                      aligning with skills and interests.
                    </li>
                    <li>
                      Application Submission: Apply to startup projects,
                      showcasing relevant skills and experience.
                    </li>
                    <li>
                      Collaboration: Collaborate directly with startup founders,
                      driving innovation and growth.
                    </li>
                    <li>
                      Storage: Store sensitive credentials such as API keys,
                      Passwords, API Secrets, etc.
                    </li>
                  </ul>
                </p>
              </div>
            </div>
            <div className="gap-4">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    Tech Stack
                  </h2>
                </div>
                <p className="text-black-600">
                  <b>Frontend:</b>
                  <ul className="list-disc ml-4">
                    <li>Framewrok/Library: React.js</li>
                    <li>Styling: Tailwind CSS</li>
                    <li>Routing: React Router</li>
                    <li>Communication: Axios</li>
                  </ul>
                  <br />
                  <b>Backend:</b>
                  <ul className="list-disc ml-4">
                    <li>Authentication: Firebase Authentication</li>
                    <li>Database: Firestore</li>
                    <li>File Storage: Firebase</li>
                  </ul>
                </p>
              </div>
            </div>

            <div className="gap-4">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                    Team Members
                  </h2>
                </div>
                <div className="flex gap-20">
                  <section className="border">
                    <img src="/public/Catalyst.jpg" height={ 150 } width={ 150 } className="rounded-full" />
                    <p>Abhinav</p>
                    <p>CAS Mavelikkara, S6 BCA</p>
                    <p>Coder</p>
                  </section>
                  <section className="border">
                  <img src="/public/Catalyst.jpg" height={ 150 } width={ 150 } className="rounded-full" />
                    <p>Akshay Pankaj</p>
                    <p>CAS Mavelikkara, S6 BCA</p>
                    <p>Coder</p>
                  </section>
                  <section className="border">
                  <img src="/public/Catalyst.jpg" height={ 150 } width={ 150 } className="rounded-full" />
                    <p>Gokuldev Sudhakaran Ezhava</p>
                    <p>CAS Mavelikkara, S6 BCA</p>
                    <p>Coder</p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AboutUs;
