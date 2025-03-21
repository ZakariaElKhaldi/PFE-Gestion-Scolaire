import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

type StatProps = {
  value: string;
  label: string;
  duration?: number;
};

const StatCounter = ({ value, label, duration = 2000 }: StatProps) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const isInView = useRef(false);
  
  // Enhanced value parsing with suffix support
  const numericPart = value.replace(/[^\d.]/g, '');
  const numericValue = parseFloat(numericPart);
  const suffix = value.replace(/[^a-zA-Z]/g, '').toUpperCase();

  let valueNumber = numericValue;
  if (suffix.includes('K')) {
    valueNumber *= 1000;
  } else if (suffix.includes('M')) {
    valueNumber *= 1_000_000;
  }
  if (isNaN(valueNumber)) valueNumber = 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView.current) {
          isInView.current = true;
          let startTime: number;
          
          const animateCount = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Smooth easing function (easeOutExpo)
            const easedProgress = 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(easedProgress * valueNumber));
            
            if (progress < 1) {
              window.requestAnimationFrame(animateCount);
            }
          };
          
          requestAnimationFrame(animateCount);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) observer.observe(countRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [duration, valueNumber]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-baseline">
        <span 
          ref={countRef}
          aria-live="polite"
          className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight"
        >
          {count.toLocaleString()}
        </span>
        <span className="text-5xl sm:text-6xl font-extrabold text-white ml-1"> {/* Changed text-primary-200 to text-white */}
          {suffix && !value.includes('+') && suffix}
          {value.includes('+') && '+'}
        </span>
      </div>
      <p className="mt-2 text-xl font-medium text-gray-100">{label}</p>
    </div>
  );
};

const DotsPattern = () => (
  <div className="h-full w-full grid grid-cols-12 gap-1">
    {Array.from({ length: 120 }).map((_, i) => (
      <div key={i} className="w-1 h-1 rounded-full bg-primary-100" />
    ))}
  </div>
);

export const StatsSection = () => {
  const stats = [
    { value: '500+', label: 'Schools' },
    { value: '25K+', label: 'Teachers' },
    { value: '250K+', label: 'Students' },
    { value: '15+', label: 'Countries' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="bg-gray-900 py-16 sm:py-24 overflow-hidden relative">
      {/* Optimized background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-y-0 right-0 w-1/2 h-full">
          <DotsPattern />
        </div>
        <div className="absolute inset-y-0 left-0 w-1/2 h-full">
          <DotsPattern />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="absolute right-full transform translate-y-1/4 translate-x-1/4 lg:translate-x-1/2"
            width={404}
            height={784}
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="pattern-squares"
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect x={0} y={0} width={4} height={4} className="text-gray-500" fill="currentColor" />
              </pattern>
            </defs>
            <rect width={404} height={784} fill="url(#pattern-squares)" />
          </svg>
        </div>
        
        <div className="relative">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              Trusted by schools across the globe
            </h2>
            <p className="mt-3 max-w-3xl mx-auto text-xl text-gray-100">
              Our platform is helping educational institutions modernize their operations
            </p>
          </motion.div>

          <motion.div 
            className="mt-12 sm:mt-16 grid grid-cols-2 gap-8 md:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={itemVariants}>
                <StatCounter value={stat.value} label={stat.label} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="mt-16 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a
              href="#contact"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-900 bg-primary-200 hover:bg-primary-100 transition-colors duration-300"
            >
              Request a demo
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};