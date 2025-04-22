import { PrismaClient } from '@prisma/client';
import { getGenderSpecificOptions } from '../src/utils/avatarHelper';
import { AvatarProps } from '@bigheads/core';

const prisma = new PrismaClient();

function generateAvatarForGender(gender: string): AvatarProps {
  const genderOptions = getGenderSpecificOptions(gender);
  
  // შემთხვევითი არჩევა მასივიდან, ტიპების შენარჩუნებით
  const randomChoice = <T extends string>(arr: readonly T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  };
  
  // ავატარის ოფციები - ვუთითებთ მხოლოდ ვალიდურ მნიშვნელობებს
  const accessory = randomChoice(['none', 'roundGlasses', 'tinyGlasses', 'shades'] as const);
  const body = gender === 'female' ? 'breasts' : 'chest';
  const circleColor = 'blue'; // მხოლოდ "blue" ან undefined არის დასაშვები!
  const clothing = randomChoice(genderOptions.clothingStyles);
  const clothingColor = randomChoice(['blue', 'green', 'red', 'white', 'black'] as const);
  const eyebrows = randomChoice(['raised', 'leftLowered', 'serious', 'angry', 'concerned'] as const);
  const eyes = randomChoice(genderOptions.eyeStyles);
  const facialHair = gender === 'female' ? 'none' : (Math.random() < 0.7 ? 
    randomChoice(['stubble', 'mediumBeard'] as const) : 'none');
  const graphic = randomChoice(['none', 'react', 'graphQL', 'gatsby', 'vue', 'redwood'] as const);
  const hair = randomChoice(genderOptions.hairStyles);
  const hairColor = randomChoice(['blonde', 'orange', 'black', 'white', 'brown', 'blue', 'pink'] as const);
  const hat = Math.random() < 0.3 ? randomChoice(['beanie', 'turban'] as const) : 'none';
  const hatColor = randomChoice(['red', 'blue', 'green', 'white', 'black'] as const);
  const lashes = gender === 'female' ? true : Math.random() > 0.5;
  const lipColor = randomChoice(['red', 'purple', 'pink', 'turqoise'] as const);
  const mouth = randomChoice(['grin', 'sad', 'openSmile', 'lips', 'open', 'serious', 'tongue'] as const);
  const skinTone = randomChoice(['light', 'yellow', 'brown', 'dark', 'red', 'black'] as const);
  
  return {
    accessory,
    body,
    circleColor,
    clothing,
    clothingColor,
    eyebrows,
    eyes,
    faceMask: false,
    facialHair,
    graphic,
    hair,
    hairColor,
    hat,
    hatColor,
    lashes,
    lipColor,
    mask: false,
    mouth,
    skinTone
  };
}

async function main() {
  // Create 5 users with unique details
  const users = [];
  
  // გენდერების სია
  const genders = ['male', 'female', 'nonbinary', 'male', 'female'];
  
  for (let i = 1; i <= 5; i++) {
    // ამ იუზერის გენდერი
    const gender = genders[i-1];
    
    // მიხვდება გენდერს და შემთხვევით აგენერირებს ავატარს ამ გენდერისთვის
    const avatarProps = generateAvatarForGender(gender);
    
    // ცოტა ვარიაცია რომ იყოს, ვცვლით ზოგიერთ პარამეტრს უშუალოდ იუზერის ID-ის მიხედვით
    avatarProps.hairColor = ['blonde', 'orange', 'black', 'white', 'brown'][i % 5] as any;
    avatarProps.skinTone = ['light', 'yellow', 'brown', 'dark', 'red'][i % 5] as any;
    
    // იუზერისთვის სპეციფიური დეტალები
    const userSpecifics = [
      { hair: 'short', eyebrows: 'raised', mouth: 'openSmile' },
      { hair: 'long', eyebrows: 'leftLowered', mouth: 'lips' },
      { hair: 'afro', eyebrows: 'serious', mouth: 'serious' },
      { hair: 'buzz', eyebrows: 'angry', mouth: 'grin' },
      { hair: 'bun', eyebrows: 'concerned', mouth: 'sad' }
    ];
    
    // დავამატოთ სპეციფიური დეტალები
    Object.assign(avatarProps, userSpecifics[i-1]);
    
    const user = await prisma.user.create({
      data: {
        id: `user${i}`,
        email: `user${i}@example.com`,
        username: `user${i}`,
        displayName: `User ${i}`,
        bio: `Hi I'm user${i}. Welcome to my profile!`,
        location: `USA`,
        job: `Developer`,
        website: `google.com`,
        gender: gender,
        avatarProps: JSON.stringify(avatarProps),
      },
    });
    users.push(user);
  }
  console.log(`${users.length} users created.`);

  // დანარჩენი კოდი რჩება უცვლელი
  // Create 5 posts for each user
  const posts = [];
  for (let i = 0; i < users.length; i++) {
    for (let j = 1; j <= 5; j++) {
      const post = await prisma.post.create({
        data: {
          desc: `Post ${j} by ${users[i].username}`,
          userId: users[i].id,
        },
      });
      posts.push(post);
    }
  }
  console.log('Posts created.');

  // Create some follows
  await prisma.follow.createMany({
    data: [
      { followerId: users[0].id, followingId: users[1].id },
      { followerId: users[0].id, followingId: users[2].id },
      { followerId: users[1].id, followingId: users[3].id },
      { followerId: users[2].id, followingId: users[4].id },
      { followerId: users[3].id, followingId: users[0].id },
    ],
  });
  console.log('Follows created.');

  // Create some likes
  await prisma.like.createMany({
    data: [
      { userId: users[0].id, postId: posts[0].id },
      { userId: users[1].id, postId: posts[1].id },
      { userId: users[2].id, postId: posts[2].id },
      { userId: users[3].id, postId: posts[3].id },
      { userId: users[4].id, postId: posts[4].id },
    ],
  });
  console.log('Likes created.');

  // Create some comments (each comment is a post linked to a parent post)
  const comments = [];
  for (let i = 0; i < posts.length; i++) {
    const comment = await prisma.post.create({
      data: {
        desc: `Comment on Post ${posts[i].id} by ${users[(i + 1) % 5].username}`,
        userId: users[(i + 1) % 5].id,
        parentPostId: posts[i].id, // Linking the comment to the post
      },
    });
    comments.push(comment);
  }
  console.log('Comments created.');

  // Create reposts using the Post model's rePostId
  const reposts = [];
  for (let i = 0; i < posts.length; i++) {
    const repost = await prisma.post.create({
      data: {
        desc: `Repost of Post ${posts[i].id} by ${users[(i + 2) % 5].username}`,
        userId: users[(i + 2) % 5].id, // The user who is reposting
        rePostId: posts[i].id, // Linking to the original post being reposted
      },
    });
    reposts.push(repost);
  }
  console.log('Reposts created.');

  // Create saved posts (users save posts they like)
  await prisma.savedPosts.createMany({
    data: [
      { userId: users[0].id, postId: posts[1].id },
      { userId: users[1].id, postId: posts[2].id },
      { userId: users[2].id, postId: posts[3].id },
      { userId: users[3].id, postId: posts[4].id },
      { userId: users[4].id, postId: posts[0].id },
    ],
  });
  console.log('Saved posts created.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });