// // src/components/SimpleAvatar.tsx
// "use client";

// import React from 'react';
// import Image from "./Image";

// type SimpleAvatarProps = {
//   imageUrl: string | null | undefined;
//   username: string;
//   size?: 'sm' | 'md' | 'lg';
//   className?: string;
// };

// const SimpleAvatar: React.FC<SimpleAvatarProps> = ({
//   imageUrl,
//   username,
//   size = 'md',
//   className = '',
// }) => {
//   // ზომების კონფიგურაცია
//   const sizeConfig = {
//     sm: { width: 40, height: 40 },
//     md: { width: 100, height: 100 },
//     lg: { width: 200, height: 200 },
//   };
  
//   const { width } = sizeConfig[size];

//   return (
//     <div className={`relative overflow-hidden rounded-full ${className}`} style={{ width, height: width }}>
//       <Image
//         src={imageUrl || undefined}
//         path={imageUrl ? undefined : 'general/noAvatar.png'}
//         alt={`${username}'s avatar`}
//         w={width}
//         h={width}
//         tr={true}
//       />
//     </div>
//   );
// };

// export default SimpleAvatar;