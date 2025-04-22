// განახლებული src/components/RightBar.tsx
import Link from "next/link";
import Search from "./Search";
import { NewsWidget } from "./News";
import Recommendations from "./Recommendations";
import TrendingHashtags from "./Hashtags/TrendingHashtags"; // იმპორტირება

const RightBar = () => {
  return (
    <div className="pt-4 flex flex-col gap-4 sticky top-0 h-max">
      <Search />
      <TrendingHashtags /> {/* დავამატეთ ტრენდული ჰეშთეგების კომპონენტი */}
      <NewsWidget />
      <Recommendations />
      <div className="text-textGray text-sm flex gap-x-4 flex-wrap">
        <Link href="/">Terms of Service</Link>
        <Link href="/">Privacy Policy</Link>
        <Link href="/">Cookie Policy</Link>
        <Link href="/">Accessibility</Link>
        <Link href="/">Ads Info</Link>
        <span>© 2025 L Corp.</span>
      </div>
    </div>
  );
};

export default RightBar;