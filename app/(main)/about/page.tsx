"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Leaf, Globe, TreePine, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Ngọc Anh",
      role: "Điều phối tour & vận hành",
      img: "1539701938214-0d9736e1c16b",
    },
    {
      name: "Hải Nam",
      role: "Trải nghiệm làng nghề",
      img: "1573497019940-1c28c88b4f3e",
    },
    {
      name: "Thu Trang",
      role: "Cộng đồng & đối tác địa phương",
      img: "1560250097-0b93528c311a",
    },
  ];

  const coreValues = [
    {
      icon: TreePine,
      title: "Tôn trọng di sản",
      description:
        "Gìn giữ bản sắc làng nghề bằng cách tôn trọng văn hóa địa phương và lan tỏa giá trị thủ công truyền thống.",
    },
    {
      icon: Users,
      title: "Trải nghiệm chân thật",
      description:
        "Thiết kế hành trình gần gũi, có chiều sâu: gặp nghệ nhân, trải nghiệm làm nghề và kết nối cộng đồng.",
    },
  ];
  
  return (
    <div className="bg-gradient-to-b from-[#f6efe5] to-white min-h-screen">
      {/* Hero Section */}
      <div className="relative z-10 overflow-hidden bg-black text-white">
        <div className="h-40">
          <Image
            src="/images/packages.jpeg"
            alt="image"
            width={1920}
            height={160}
            className="z-1 absolute left-0 top-0 h-full w-full object-cover"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg text-center px-4 capitalize">
              Về Làng Nghề Travel
            </h1>
          </div>
        </div>
        <div
          className="relative z-20 h-32 w-full -scale-y-[1] bg-contain bg-repeat-x"
          style={{
            backgroundImage: "url('/images/banner_style.png')",
            filter:
              "invert(92%) sepia(2%) saturate(1017%) hue-rotate(342deg) brightness(106%) contrast(93%)",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16 lg:py-20">
        {/* Introduction */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center mb-4 md:mb-6">
            <span className="text-xs sm:text-sm md:text-base font-semibold uppercase tracking-wide text-green-800 bg-green-100 px-2 sm:px-3 py-1 rounded-full">
              Hành trình về nguồn cội
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
            Chào mừng đến với <span className="text-green-600">Làng Nghề</span> Travel
          </h2>
        </div>

        {/* Mission & Values Grid */}
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          {/* Who We Are Section */}
          <div className="lg:col-span-7">
            <div className="bg-green-50 rounded-2xl shadow-lg p-6 md:p-8 h-full">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-3">
                    <Leaf className="text-green-500" size={24} />
                    <span className="text-green-600 font-semibold">
                      Who We Are
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Kết nối tinh hoa làng nghề Việt
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    Làng Nghề Travel được xây dựng để đưa bạn đến gần hơn với những giá trị truyền thống: từ gốm, dệt, mây tre đan đến các nghề thủ công đặc sắc trên khắp Việt Nam. Chúng tôi tập trung vào trải nghiệm chân thật, có hướng dẫn, và tôn trọng cộng đồng địa phương.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Globe className="text-green-500" size={20} />
                      <span className="text-gray-700 text-sm md:text-base">
                        Bản sắc
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TreePine className="text-green-500" size={20} />
                      <span className="text-gray-700 text-sm md:text-base">
                        Trải nghiệm
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative aspect-square md:aspect-[4/5]">
                  <Image
                    src="https://images.unsplash.com/photo-1516426122078-c23e76319801"
                    alt="Làng nghề Việt Nam"
                    fill
                    className="rounded-2xl object-cover shadow-lg transition-transform hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Our Services Section */}
          <div className="lg:col-span-5 space-y-8">
            {/* Core Values */}
            <div className="bg-green-50 rounded-2xl shadow-lg p-6 md:p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                  Dịch vụ
                </h3>
                <p className="text-gray-600">
                  Hành trình làng nghề, workshop và trải nghiệm văn hóa
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-white/50 p-4 rounded-xl">
                  <ul className="list-disc ml-5 text-gray-700">
                    <li>Tour làng nghề truyền thống</li>
                    <li>Workshop trải nghiệm thủ công</li>
                    <li>Tour văn hóa & ẩm thực địa phương</li>
                    <li>Thiết kế hành trình theo nhóm/đoàn</li>
                    <li>Đặt xe, hướng dẫn viên và hỗ trợ lịch trình</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="bg-green-50 rounded-2xl shadow-lg p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                Tác động cộng đồng
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Chúng tôi ưu tiên hợp tác trực tiếp với nghệ nhân và hộ gia đình làm nghề, giúp trải nghiệm du lịch mang lại giá trị thực cho cộng đồng địa phương và góp phần lan tỏa, bảo tồn nghề truyền thống.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tôn trọng di sản – trải nghiệm chân thật – kết nối cộng đồng
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className="bg-green-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <value.icon
                    className="text-green-500 shrink-0"
                    size={24}
                  />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">
                      {value.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Đội ngũ của chúng tôi
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Những con người yêu văn hóa Việt, đồng hành cùng bạn trong từng trải nghiệm làng nghề.
          </p>
          <Link href="/careers">
            <Button
              variant="default"
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white transform transition hover:scale-105"
            >
              Gia nhập đội ngũ
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden group"
            >
              <Image
                src={`https://images.unsplash.com/photo-${member.img}?w=400&h=600&fit=crop`}
                alt={member.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-green-100/95 p-6 backdrop-blur-sm transform transition-transform duration-300 group-hover:translate-y-0">
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-gray-700">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
