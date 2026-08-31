import React from 'react';
import { Sparkles } from 'lucide-react';

interface RobotAvatarProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  isGreeting?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showHands?: boolean;
}

export function RobotAvatar({
  isSpeaking = false,
  isListening = false,
  isGreeting = false,
  size = 'md',
  showHands = true,
}: RobotAvatarProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
  }[size];

  return (
    <div className={`relative flex flex-col items-center justify-center ${sizeClasses} select-none`}>
      {/* Background Glow / Aura */}
      <div 
        className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 pointer-events-none ${
          isListening 
            ? 'bg-amber-400/40 scale-125 animate-pulse' 
            : isSpeaking 
            ? 'bg-emerald-400/35 scale-120 animate-pulse' 
            : 'bg-primary/20 scale-105'
        }`} 
      />

      {/* SVG Robot */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-xl z-10 transition-transform duration-300 transform hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="robotGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="60%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="metalShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- Antenna & Signal Waves --- */}
        <g>
          {/* Antenna Pole */}
          <line x1="100" y1="42" x2="100" y2="18" stroke="url(#robotGoldGrad)" strokeWidth="4" strokeLinecap="round" />
          {/* Antenna Ball */}
          <circle 
            cx="100" 
            cy="14" 
            r="8" 
            fill={isListening ? '#f59e0b' : isSpeaking ? '#10b981' : '#fbbf24'} 
            filter="url(#neonGlow)"
            className={isListening || isSpeaking ? 'animate-pulse' : ''}
          />
          {/* Signal Radiating Rings when listening */}
          {isListening && (
            <>
              <circle cx="100" cy="14" r="14" stroke="#f59e0b" strokeWidth="1.5" opacity="0.8" className="animate-ping" />
              <circle cx="100" cy="14" r="22" stroke="#f59e0b" strokeWidth="1.2" opacity="0.4" className="animate-ping" style={{ animationDuration: '1.5s' }} />
            </>
          )}
          {/* Sparkles if greeting */}
          {isGreeting && (
            <g className="animate-bounce" style={{ transformOrigin: '100px 14px' }}>
              <circle cx="82" cy="10" r="2" fill="#fbbf24" />
              <circle cx="118" cy="12" r="2" fill="#fbbf24" />
            </g>
          )}
        </g>

        {/* --- Robot Ears / Audio Sensors --- */}
        <g>
          {/* Left Ear */}
          <rect x="36" y="65" width="12" height="26" rx="5" fill="url(#robotGoldGrad)" />
          <circle cx="42" cy="78" r="3" fill="#ffffff" opacity="0.9" />
          
          {/* Right Ear */}
          <rect x="152" y="65" width="12" height="26" rx="5" fill="url(#robotGoldGrad)" />
          <circle cx="158" cy="78" r="3" fill="#ffffff" opacity="0.9" />
        </g>

        {/* --- Robot Head Outer Shell --- */}
        <g>
          <rect
            x="46"
            y="38"
            width="108"
            height="82"
            rx="24"
            fill="url(#robotBodyGrad)"
            stroke="url(#robotGoldGrad)"
            strokeWidth="3.5"
          />
          {/* Shiny Highlights */}
          <rect x="52" y="44" width="96" height="12" rx="6" fill="url(#metalShine)" />
        </g>

        {/* --- Visor Screen (Face Display) --- */}
        <rect
          x="56"
          y="50"
          width="88"
          height="58"
          rx="16"
          fill="url(#visorGrad)"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* --- Cute LED Eyes (Blinking & Glowing) --- */}
        <g>
          {/* Left Eye */}
          <g className="transition-all duration-300">
            <ellipse
              cx="80"
              cy="70"
              rx="9"
              ry={isGreeting ? 10 : 8}
              fill={isListening ? '#fef08a' : '#38bdf8'}
              filter="url(#neonGlow)"
            />
            <circle cx="82" cy="68" r="3.5" fill="#ffffff" />
            <circle cx="77" cy="72" r="1.5" fill="#ffffff" />
          </g>

          {/* Right Eye */}
          <g className="transition-all duration-300">
            <ellipse
              cx="120"
              cy="70"
              rx="9"
              ry={isGreeting ? 10 : 8}
              fill={isListening ? '#fef08a' : '#38bdf8'}
              filter="url(#neonGlow)"
            />
            <circle cx="122" cy="68" r="3.5" fill="#ffffff" />
            <circle cx="117" cy="72" r="1.5" fill="#ffffff" />
          </g>

          {/* Cheerful Blush / Cheek Glow */}
          <ellipse cx="70" cy="84" rx="4.5" ry="2.5" fill="#fb7185" opacity="0.6" />
          <ellipse cx="130" cy="84" rx="4.5" ry="2.5" fill="#fb7185" opacity="0.6" />
        </g>

        {/* --- Digital Mouth / Equalizer Waves --- */}
        <g>
          {isSpeaking ? (
            /* Speaking Animated Equalizer Bars */
            <g transform="translate(85, 87)" fill="#10b981" filter="url(#neonGlow)">
              <rect x="0" y="2" width="3.5" height="10" rx="1.5" className="animate-pulse" />
              <rect x="7" y="0" width="3.5" height="14" rx="1.5" className="animate-bounce" />
              <rect x="14" y="3" width="3.5" height="9" rx="1.5" className="animate-pulse" style={{ animationDelay: '100ms' }} />
              <rect x="21" y="1" width="3.5" height="13" rx="1.5" className="animate-bounce" style={{ animationDelay: '200ms' }} />
              <rect x="28" y="2" width="3.5" height="10" rx="1.5" className="animate-pulse" style={{ animationDelay: '300ms' }} />
            </g>
          ) : isListening ? (
            /* Listening Wave */
            <g transform="translate(88, 91)" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" filter="url(#neonGlow)">
              <path d="M0,0 Q6,-4 12,0 T24,0" className="animate-pulse" />
            </g>
          ) : (
            /* Friendly Smile */
            <path
              d="M 88 90 Q 100 99 112 90"
              stroke="#fbbf24"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              filter="url(#neonGlow)"
            />
          )}
        </g>

        {/* --- Robot Neck Connector --- */}
        <rect x="88" y="120" width="24" height="10" rx="3" fill="url(#robotGoldGrad)" />

        {/* --- Robot Body & School Emblem Chest --- */}
        <g>
          <path
            d="M 60 130 L 140 130 L 132 182 L 68 182 Z"
            fill="url(#robotBodyGrad)"
            stroke="url(#robotGoldGrad)"
            strokeWidth="3"
          />
          {/* Chest Screen / School Badge */}
          <circle cx="100" cy="154" r="16" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" />
          <text x="100" y="158" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="serif">
            BVPS
          </text>
        </g>

        {/* --- Hands / Namaste Gesture 🙏 --- */}
        {showHands && (
          <g>
            {isGreeting ? (
              /* FOLDED HANDS (NAMASTE 🙏 GESTURE) */
              <g className="transition-all duration-500">
                {/* Left Arm folded inward */}
                <path
                  d="M 58 136 Q 78 152 92 148"
                  stroke="url(#robotGoldGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Right Arm folded inward */}
                <path
                  d="M 142 136 Q 122 152 108 148"
                  stroke="url(#robotGoldGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Joined Palms (Namaste 🙏) in Center */}
                <g transform="translate(100, 148)">
                  <ellipse cx="-4" cy="-2" rx="5" ry="9" fill="#fbbf24" transform="rotate(-12)" stroke="#b45309" strokeWidth="1" />
                  <ellipse cx="4" cy="-2" rx="5" ry="9" fill="#fbbf24" transform="rotate(12)" stroke="#b45309" strokeWidth="1" />
                  {/* Aura Sparkle */}
                  <circle cx="0" cy="-12" r="3" fill="#ffffff" filter="url(#neonGlow)" className="animate-ping" />
                </g>
              </g>
            ) : (
              /* Friendly Waving Hand */
              <g>
                {/* Left Arm Resting */}
                <path
                  d="M 58 138 Q 42 155 46 172"
                  stroke="url(#robotGoldGrad)"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="47" cy="173" r="6" fill="#fbbf24" />

                {/* Right Arm Waving / Ready */}
                <path
                  d="M 142 138 Q 160 145 162 130"
                  stroke="url(#robotGoldGrad)"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                  fill="none"
                  className={isSpeaking ? 'animate-bounce' : ''}
                />
                <circle cx="163" cy="128" r="6.5" fill="#fbbf24" />
                {/* Little wave sparkle */}
                <circle cx="174" cy="120" r="2.5" fill="#fbbf24" className="animate-ping" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
