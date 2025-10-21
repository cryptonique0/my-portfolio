'use client';

interface ProjectCardProps {
  title: string;
  description: string;
  tech: string[];
  onClick: () => void;
}

const ProjectCard = ({ title, description, tech, onClick }: ProjectCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-all duration-300 group"
    >
      <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-300 mb-4">
        {description}
      </p>
      <div className="flex flex-wrap gap-2">
        {tech.map((item, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-900/30 rounded text-sm border border-blue-500/20"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProjectCard;