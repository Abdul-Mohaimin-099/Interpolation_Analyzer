import React, { useState } from 'react';

function Info() {
  const [imageError, setImageError] = useState({});
  
  const developers = [
    {
      name: "Abdul Mohaimin",
      role: "Team Leader & Lead Developer",
      description: "Specializes in numerical methods and algorithm implementation",
      github: "https://github.com/Abdul-Mohaimin-099",
      linkedin: "https://www.linkedin.com/in/abdul-mohaimin-95543a353/",
      image: "/images/developers/dp.jpg"
    },
    
  ];

  const handleImageError = (devName) => {
    setImageError(prev => ({
      ...prev,
      [devName]: true
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white/80 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-[#333333] mb-8 text-center">
          Meet Our Team
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {developers.map((dev, index) => (
            <div
              key={index}
              className="bg-white/50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col items-center mb-6">
                {!imageError[dev.name] ? (
                  <img
                    src={dev.image}
                    alt={dev.name}
                    onError={() => handleImageError(dev.name)}
                    className="w-40 h-40 rounded-full object-cover border-4 border-[#ADD8E6] shadow-lg mb-4"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-[#ADD8E6]/30 flex items-center justify-center border-4 border-[#ADD8E6] shadow-lg mb-4">
                    <span className="text-4xl text-[#333333]">
                      {dev.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-[#333333] mb-2">
                    {dev.name}
                  </h3>
                  <p className="text-[#ADD8E6] font-medium mb-3">{dev.role}</p>
                </div>
              </div>
              <p className="text-[#333333]/70 mb-4 text-center">{dev.description}</p>
              <div className="flex justify-center space-x-4">
                <a
                  href={dev.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#333333] hover:text-[#ADD8E6] transition-colors duration-300"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href={dev.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#333333] hover:text-[#ADD8E6] transition-colors duration-300"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-semibold text-[#333333] mb-4">About the Project</h3>
          <p className="text-[#333333]/70 max-w-2xl mx-auto">
            The Interpolation Analyzer is an advanced data visualization tool designed to help users understand and compare different interpolation methods. Our team has developed this tool to make complex numerical methods more accessible and interactive for students and professionals alike.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Info; 