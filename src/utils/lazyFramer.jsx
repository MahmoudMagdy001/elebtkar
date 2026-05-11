import React, { useState, useEffect } from 'react';

const ELEMENTS = ['div','section','h1','h2','h3','h4','p','span','img','ul','li','a','header','footer','nav','main','article','form','button'];

function createLazyComponent(tag) {
  return function LazyMotionComponent(props) {
    const [Comp, setComp] = useState(null);

    useEffect(() => {
      let mounted = true;
      import('framer-motion')
        .then((mod) => {
          if (!mounted) return;
          // fallback to div if specific tag not available
          setComp(() => mod.motion[tag] || mod.motion.div);
        })
        .catch(() => {
          // ignore failures — fallback will render plain element
        });
      return () => { mounted = false; };
    }, []);

    if (!Comp) {
      const { children, ...rest } = props;
      return React.createElement(tag, rest, children);
    }

    const MotionComp = Comp;
    return <MotionComp {...props} />;
  };
}

const motion = {};
ELEMENTS.forEach((el) => { motion[el] = createLazyComponent(el); });

export function AnimatePresence(props) {
  const [Comp, setComp] = useState(null);
  useEffect(() => {
    let mounted = true;
    import('framer-motion').then((mod) => { if (mounted) setComp(() => mod.AnimatePresence); }).catch(() => {});
    return () => { mounted = false; };
  }, []);
  if (!Comp) return <>{props.children}</>;
  const AP = Comp;
  return <AP {...props} />;
}

export { motion };
