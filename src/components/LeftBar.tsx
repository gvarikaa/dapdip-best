import Link from "next/link";
import CustomImage from "./CustomImage"; // ეს შევცვალეთ
import Socket from "./Socket";
import Notification from "./Notification";
import { currentUser } from "@clerk/nextjs/server";
import Logout from "./Logout";

const menuList = [
  {
    id: 1,
    name: "Homepage",
    link: "/",   // ეს უკვე სწორია
    icon: "home.svg",
  },
  {
    id: 2,
    name: "Explore",
    link: "/explore",  // შეცვალეთ
    icon: "explore.svg",
  },
  // ...
  {
    id: 4,
    name: "Messages",
    link: "/messages",  // შეცვალეთ
    icon: "message.svg",
  },
  {
    id: 5,
    name: "Bookmarks",
    link: "/bookmarks",  // შეცვალეთ
    icon: "bookmark.svg",
  },
  {
    id: 6,
    name: "Jobs",
    link: "/jobs",  // შეცვალეთ
    icon: "job.svg",
  },
  {
    id: 7,
    name: "Communities",
    link: "/communities",  // შეცვალეთ
    icon: "community.svg",
  },
  {
    id: 8,
    name: "Premium",
    link: "/premium",  // შეცვალეთ
    icon: "logo.svg",
  },
  {
    id: 9,
    name: "Profile",
    link: "/profile",  // შეცვალეთ
    icon: "profile.svg",
  },
  {
    id: 10,
    name: "More",
    link: "/more",  // შეცვალეთ
    icon: "more.svg",
  },
];

const LeftBar = async () => {
  const user = await currentUser();

  return (
    <div className="h-screen sticky top-0 flex flex-col justify-between pt-2 pb-8">
      {/* LOGO MENU BUTTON */}
      <div className="flex flex-col gap-4 text-lg items-center xxl:items-start">
        {/* LOGO */}
        <Link href="/" className="p-2 rounded-full hover:bg-[#181818] ">
          <CustomImage src="icons/logo.svg" alt="logo" w={24} h={24} />
        </Link>
        {/* MENU LIST */}
        <div className="flex flex-col gap-4">
          {menuList.map((item, i) => (
            <div key={item.id || i}>
              {i === 2 && user && (
                <div>
                  <Notification />
                </div>
              )}
              <Link
                href={item.link}
                className="p-2 rounded-full hover:bg-[#181818] flex items-center gap-4"
              >
                <CustomImage
                  src={`icons/${item.icon}`}
                  alt={item.name}
                  w={24}
                  h={24}
                />
                <span className="hidden xxl:inline">{item.name}</span>
              </Link>
            </div>
          ))}
        </div>
        {/* BUTTON */}
        <Link
          href="/compose/post"
          className="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center xxl:hidden"
        >
          <CustomImage src="icons/post.svg" alt="new post" w={24} h={24} />
        </Link>
        <Link
          href="/compose/post"
          className="hidden xxl:block bg-white text-black rounded-full font-bold py-2 px-20"
        >
          Post
        </Link>
      </div>
      {user && (
        <>
          <Socket />
          {/* USER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 relative rounded-full overflow-hidden">
                <CustomImage
                  src={user?.imageUrl}
                  alt=""
                  w={100}
                  h={100}
                  tr={true}
                />
              </div>
              <div className="hidden xxl:flex flex-col">
                <span className="font-bold">{user?.username}</span>
                <span className="text-sm text-textGray">@{user?.username}</span>
              </div>
            </div>
            <Logout/>
          </div>
        </>
      )}
    </div>
  );
};

export default LeftBar;