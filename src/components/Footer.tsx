export default function Footer() {
  return (
    <footer className="py-8 mt-12 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Kaushal Kumar Agarwal. All rights reserved.</p>
      </div>
    </footer>
  );
}