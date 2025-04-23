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

  // ჰეშთეგების შექმნა
  console.log('Creating hashtags...');
  const hashtagNames = ['javascript', 'react', 'nextjs', 'typescript', 'coding', 'webdev', 'frontend', 'programming', 'tech', 'development'];
  
  const hashtags = [];
  for (const name of hashtagNames) {
    const hashtag = await prisma.hashtag.create({
      data: { name }
    });
    hashtags.push(hashtag);
  }
  
  // პოსტების დაკავშირება ჰეშთეგებთან
  console.log('Linking posts with hashtags...');
  for (let i = 0; i < posts.length; i++) {
    // თითოეულ პოსტს დავაკავშიროთ 1-3 შემთხვევით ჰეშთეგთან
    const hashtagCount = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < hashtagCount; j++) {
      const randomHashtagIndex = Math.floor(Math.random() * hashtags.length);
      
      // ვცადოთ ჰეშთეგის დაკავშირება პოსტთან, თუ უკვე არ არის დაკავშირებული
      try {
        await prisma.postHashtag.create({
          data: {
            postId: posts[i].id,
            hashtagId: hashtags[randomHashtagIndex].id
          }
        });
      } catch (error) {
        // თუ უკვე დაკავშირებულია, გავაგრძელოთ
        continue;
      }
    }
  }
  console.log('Post hashtags created.');

  // დავამატოთ კოდი საუბრების (Conversations) შესაქმნელად
  console.log('Creating conversations...');
  
  // შევქმნათ რამდენიმე პირადი საუბარი მომხმარებლებს შორის
  const privateConversations = [];
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: users[i].id },
              { userId: users[j].id }
            ]
          }
        }
      });
      privateConversations.push(conversation);
    }
  }
  
  // შევქმნათ ერთი ჯგუფური ჩატი ყველა მომხმარებლით
  const groupConversation = await prisma.conversation.create({
    data: {
      name: "პროექტის ჯგუფი",
      isGroup: true,
      groupAdminId: users[0].id,
      participants: {
        create: users.map(user => ({ userId: user.id }))
      }
    }
  });
  
  console.log(`Created ${privateConversations.length} private conversations and 1 group conversation.`);
  
  // დავამატოთ მესიჯები საუბრებში
  console.log('Creating messages...');
  
  const messageTemplates = [
    "გამარჯობა! როგორ ხარ?",
    "დღეს რას აკეთებ?",
    "პროექტზე როგორ მიდის საქმე?",
    "შეგიძლია დამეხმარო ამ საკითხში?",
    "მადლობა დახმარებისთვის!",
    "ხვალ რას გეგმავ?",
    "შეხვედრა ხვალ 15:00-ზე გვაქვს",
    "დოკუმენტაცია გადავხედე და ძალიან კარგად გამოიყურება",
    "ნახე ახალი ფუნქციონალი რაც დავამატე",
    "ვფიქრობ, ეს პრობლემა უკვე გამოვასწორე"
  ];
  
  // დროის გადანაწილება წარსულში მესიჯებისთვის
  const getRandomPastDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    return date;
  };
  
  // პირადი საუბრებისთვის მესიჯები
  for (const conversation of privateConversations) {
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId: conversation.id },
      select: { userId: true }
    });
    
    // თითოეული საუბრისთვის 3-10 შემთხვევითი მესიჯი
    const messageCount = Math.floor(Math.random() * 8) + 3;
    
    // ვქმნით მესიჯებს ამ საუბარში
    for (let i = 0; i < messageCount; i++) {
      const sender = participants[i % 2].userId;
      const messageTemplate = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
      const createdAt = getRandomPastDate(30); // ბოლო 30 დღის განმავლობაში
      const isRead = i % 2 === 0; // ნახევარი წაკითხულია, ნახევარი - არა
      
      await prisma.message.create({
        data: {
          content: messageTemplate,
          senderId: sender,
          conversationId: conversation.id,
          isRead: isRead,
          readAt: isRead ? new Date(createdAt.getTime() + 1000 * 60) : null, // წაკითხვიდან 1 წუთის შემდეგ
          createdAt: createdAt
        }
      });
    }
  }
  
  // ჯგუფური საუბრისთვის მესიჯები
  for (let i = 0; i < 15; i++) {
    const sender = users[i % users.length].id;
    const messageTemplate = `${messageTemplates[i % messageTemplates.length]} #${i + 1}`;
    const createdAt = getRandomPastDate(15); // ბოლო 15 დღის განმავლობაში
    
    await prisma.message.create({
      data: {
        content: messageTemplate,
        senderId: sender,
        conversationId: groupConversation.id,
        isRead: true,
        readAt: new Date(createdAt.getTime() + 1000 * 60 * 2), // 2 წუთის შემდეგ
        createdAt: createdAt
      }
    });
  }
  
  // დავამატოთ რამდენიმე მესიჯი ატაჩმენტებით
  console.log('Creating messages with attachments...');
  
  const attachmentTypes = ['image', 'file', 'pdf', 'doc'];
  const attachmentUrls = [
    'https://ik.imagekit.io/demo/sample-image.jpg',
    'https://ik.imagekit.io/demo/medium_cafe_B1iTdD0C.jpg',
    'https://ik.imagekit.io/demo/img/sample-image.jpg',
    'https://ik.imagekit.io/demo/img/tree.jpg'
  ];
  
  // დავამატოთ ატაჩმენტები ჯგუფურ საუბარში
  for (let i = 0; i < 3; i++) {
    const sender = users[Math.floor(Math.random() * users.length)].id;
    const attachmentType = attachmentTypes[i % attachmentTypes.length];
    const attachmentUrl = attachmentUrls[i % attachmentUrls.length];
    const createdAt = getRandomPastDate(10);
    
    await prisma.message.create({
      data: {
        content: `გიგზავნი ${attachmentType} ფაილს`,
        senderId: sender,
        conversationId: groupConversation.id,
        isRead: true,
        readAt: new Date(createdAt.getTime() + 1000 * 60),
        createdAt: createdAt,
        attachmentUrl: attachmentUrl,
        attachmentType: attachmentType
      }
    });
  }
  
  // დავამატოთ ატაჩმენტები რამდენიმე პირად საუბარში
  for (let i = 0; i < 5; i++) {
    const conversation = privateConversations[Math.floor(Math.random() * privateConversations.length)];
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId: conversation.id },
      select: { userId: true }
    });
    
    const sender = participants[Math.floor(Math.random() * participants.length)].userId;
    const attachmentType = attachmentTypes[Math.floor(Math.random() * attachmentTypes.length)];
    const attachmentUrl = attachmentUrls[Math.floor(Math.random() * attachmentUrls.length)];
    const createdAt = getRandomPastDate(20);
    
    await prisma.message.create({
      data: {
        content: `ნახე ეს ${attachmentType}`,
        senderId: sender,
        conversationId: conversation.id,
        isRead: Math.random() > 0.5,
        readAt: Math.random() > 0.5 ? new Date(createdAt.getTime() + 1000 * 60) : null,
        createdAt: createdAt,
        attachmentUrl: attachmentUrl,
        attachmentType: attachmentType
      }
    });
  }
  
  console.log('Messages with attachments created.');
  
  // ბოლო აქტივობის დროები განვაახლოთ მომხმარებლებისთვის
  console.log('Updating user activity times...');
  
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        updatedAt: getRandomPastDate(Math.floor(Math.random() * 5) + 1) // ბოლო 1-5 დღე
      }
    });
  }
  
  console.log('User activity times updated.');
  console.log('Seed completed successfully!');
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