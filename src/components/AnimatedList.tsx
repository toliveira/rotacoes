import { AnimatePresence, motion } from "framer-motion";

export default function AnimatedList({ items, render }: { items: any[]; render: (item: any, i: number) => React.ReactNode }) {
  return (
    <AnimatePresence>
      {items.map((item, i) => (
        <motion.div
          key={(item?.id ?? i) as React.Key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, delay: i * 0.02 }}
        >
          {render(item, i)}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

