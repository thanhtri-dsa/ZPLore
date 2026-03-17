import Image from 'next/image'

const UserAvatars = () => {
  // Array of local avatar images
  const avatars = [
    '/images/avartar1.jpg',
    '/images/avartar2.jpg', 
    '/images/avartar3.jpg',
    '/images/avartar4.jpg'
  ]

  return (
    <div className="bg-gradient-to-r from-green-50 to-green-600  rounded-xl shadow-lg p-3">
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center -space-x-4">
          {avatars.map((src, index) => (
            <div 
              key={index}
              className="relative"
              title={`User ${index + 1}`}
            >
              <Image
                src={src}
                alt={`User ${index + 1}`}
                width={48}
                height={48}
                className="
                  relative inline-block 
                  h-12 w-12 
                  rounded-full 
                  border-2 border-white 
                  object-cover object-center 
                  hover:z-10 focus:z-10
                  transition-transform 
                  hover:scale-110
                "
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserAvatars
