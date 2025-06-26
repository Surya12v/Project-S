import React from 'react';
import { motion } from 'framer-motion';
import { Card } from 'antd';

const AnimatedCard = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card {...props}>
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard;
