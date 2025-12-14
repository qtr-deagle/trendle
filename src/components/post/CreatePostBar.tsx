import { Type, Camera, Quote, Link2, Headphones, Video } from "lucide-react";

const postTypes = [
  { icon: Type, label: "Text", color: "text-foreground" },
  { icon: Camera, label: "Photo", color: "text-orange-500" },
  { icon: Quote, label: "Quote", color: "text-orange-400" },
  { icon: Link2, label: "Link", color: "text-green-500" },
  { icon: Headphones, label: "Audio", color: "text-purple-500" },
  { icon: Video, label: "Video", color: "text-pink-500" },
];

const CreatePostBar = () => {
  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-center gap-8">
        {postTypes.map((type) => (
          <button
            key={type.label}
            className="flex flex-col items-center gap-2 group cursor-pointer transition-all duration-200 hover:scale-110"
          >
            <type.icon className={`w-8 h-8 ${type.color} group-hover:scale-110 transition-transform`} />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {type.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CreatePostBar;
