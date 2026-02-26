import logo from '/images/home_logo.png';
import bgImage from '/images/1.webp';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-yellow-500 py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img src={logo} alt="University Logo" className="w-20 h-20 rounded-full object-cover" />
          </div>
          
          {/* Header Text */}
          <div className="flex-1">
            <h1 className="text-white text-2xl md:text-3xl font-bold uppercase mb-1">
              Welcome to the Laboratory Equipment Management System
            </h1>
            <p className="text-red-900 text-lg md:text-xl font-semibold">
              FACULTY OF ENGINEERING
            </p>
            <p className="text-red-900 text-lg md:text-xl font-semibold">
              UNIVERSITY OF RUHUNA
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Section */}
      <main 
        className="flex-1 flex items-center justify-center px-4 py-12"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="relative">
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black opacity-30 rounded-lg"></div>
          
          {/* Content Card */}
          <div className="relative bg-white bg-opacity-95 rounded-lg shadow-2xl p-8 md:p-12 max-w-2xl">
            <h2 className="text-red-900 text-2xl md:text-3xl font-bold text-center mb-4">
              Welcome to the Faculty of Engineering
            </h2>
            <h3 className="text-red-900 text-xl md:text-2xl font-bold text-center mb-6">
              Equipment Management System
            </h3>
            
            <p className="text-gray-800 text-center text-sm md:text-base leading-relaxed mb-8">
              a centralized platform that makes managing laboratory<br />
              equipment simple and efficient. Track, maintain,<br />
              and access all devices with ease while<br />
              ensuring transparency and organization<br />
              across every laboratory.
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-4 items-center">
              <button 
                onClick={() => window.location.href = '/register'}
                className="w-full max-w-xs bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-full uppercase text-lg transition-all shadow-md hover:shadow-lg"
              >
                SIGNUP
              </button>
              <button 
                onClick={() => window.location.href = '/login'}
                className="w-full max-w-xs bg-red-900 hover:bg-red-800 text-white font-bold py-3 px-8 rounded-full uppercase text-lg transition-all shadow-md hover:shadow-lg"
              >
                LOGIN
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;