import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll && currentScroll > 80) {
        setShow(false);
        setIsOpen(false);
      } else {
        setShow(true);
      }

      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ MENU ANIMATION (LEFT → CENTER → LEFT)
  const menuVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
    exit: { x: "-100%" }
  };

  // ✅ STAGGER TEXT
  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1 }
    })
  };

  const links = [
    "Terms & Conditions",
    "Privacy Policy",
    "Community Guidelines",
    "Coins Policy",
    "Delete Account FAQ"
  ];

  return (
    <>
      {/* NAVBAR */}
      <motion.div
        animate={{ y: show ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/5 border-b border-white/10"
      >
        <div className="mx-auto flex items-center justify-between px-6 xl:px-10 py-4">

          {/* LOGO */}
          <img
            src="/Images/FFL.svg"
            alt="logo"
            className="h-10 md:h-14 lg:h-20 object-contain"
          />

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex gap-6 text-white/90 text-sm">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Guidelines</a>
            <a href="#">Coins</a>
            <a href="#">FAQ</a>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            <img
              src="/Images/google-play.png"
              alt="play"
              className="h-9 hidden md:block"
            />

            {/* HAMBURGER */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-black text-2xl"
            >
              {isOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-violet-400 flex flex-col justify-center px-8 text-white text-xl"
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-3xl"
            >
              ✕
            </button>

            {/* LINKS */}
            <div className="flex flex-col gap-6">
              {links.map((link, i) => (
                <motion.a
                  key={i}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link}
                </motion.a>
              ))}
            </div>

            {/* GOOGLE PLAY */}
            <motion.img
              src="/Images/google-play.png"
              alt="play"
              className="h-12 mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}