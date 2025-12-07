import { Github, Mail, Gamepad2, BookOpen } from "lucide-react";
import { ZoomImage } from "@/components/ZoomImage";

export default function MePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 select-none">
      {/* Header Profile */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="w-32 h-32 mb-8 rounded-full overflow-hidden border-2 border-black/10">
          <ZoomImage
            src="https://avatars.githubusercontent.com/u/120795714"
            alt="mCell Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4 tracking-tight">
          mCell
        </h1>
        <p className="text-gray-600 text-base sm:text-lg font-light">
          Engineering · Design · Intelligence
        </p>
      </div>

      {/* Intro */}
      <div className="prose max-w-none mb-16 text-center">
        <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-light">
          <span className="text-black font-medium">Full Stack Developer</span>{" "}
          exploring the frontiers of DevOps and AI. Building digital experiences
          with <span className="text-blue-600">TypeScript</span> and{" "}
          <span className="text-blue-600">Golang</span>.
        </p>
      </div>

      {/* Connect - Minimalist Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-20">
        <a
          href="https://github.com/minorcell"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 group"
        >
          <div className="p-4 rounded-full bg-black/5 group-hover:bg-black/10 group-hover:scale-110 transition-all duration-300">
            <Github className="w-6 h-6 text-black" />
          </div>
          <span className="text-sm text-gray-500 group-hover:text-black transition-colors">
            GitHub
          </span>
        </a>

        <a
          href="https://juejin.cn/user/2280829967146779"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 group"
        >
          <div className="p-4 rounded-full bg-black/5 group-hover:bg-black/10 group-hover:scale-110 transition-all duration-300">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm text-gray-500 group-hover:text-black transition-colors">
            Blog
          </span>
        </a>

        <a
          href="mailto:minorcell6789@gmail.com"
          className="flex flex-col items-center gap-3 group"
        >
          <div className="p-4 rounded-full bg-black/5 group-hover:bg-black/10 group-hover:scale-110 transition-all duration-300">
            <Mail className="w-6 h-6 text-red-500" />
          </div>
          <span className="text-sm text-gray-500 group-hover:text-black transition-colors">
            Email
          </span>
        </a>

        <a
          href="https://steamcommunity.com/profiles/76561199379749961/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 group"
        >
          <div className="p-4 rounded-full bg-black/5 group-hover:bg-black/10 group-hover:scale-110 transition-all duration-300">
            <Gamepad2 className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-sm text-gray-500 group-hover:text-black transition-colors">
            Steam
          </span>
        </a>
      </div>

      {/* Footer Quote/Info */}
      <div className="text-center border-t border-black/5 pt-12">
        <p className="text-sm text-gray-500 font-mono">minorcell / mCell</p>
      </div>
    </div>
  );
}
