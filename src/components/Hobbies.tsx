import React from 'react';

interface Hobby {
  name: string;
  icon: string;
}

const hobbies: Hobby[] = [
  { name: 'Binge Watching', icon: '🍿' },
  { name: 'Traveling', icon: '✈️' },
  { name: 'Singing', icon: '🎤' },
  { name: 'Reading', icon: '📚' },
];

interface HobbyCardProps {
  hobby: Hobby;
  index: number;
}

const HobbyCard: React.FC<HobbyCardProps> = ({ hobby }) => (
  <div className="flex flex-col items-center justify-center p-2 transition-all hover:bg-gray-100 dark:hover:bg-[#252B3B] rounded-lg group">
    <div className="text-2xl mb-1.5 transform group-hover:scale-110 transition-all duration-300">
      {hobby.icon}
    </div>
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white text-center leading-tight">
      {hobby.name}
    </span>
  </div>
);

const Hobbies: React.FC = () => {
  return (
    <div className="bg-[#F8FAFC] dark:bg-[#151B28] rounded-lg p-3 transition-colors">
      <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600 mb-3">
        Hobbies
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-1.5">
        {hobbies.map((hobby, index) => (
          <HobbyCard key={hobby.name} hobby={hobby} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Hobbies;