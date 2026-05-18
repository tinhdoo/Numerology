const charMap = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const reduceNumber = (num, allowMaster = true) => {
  if (isNaN(num) || num === null) return 0;
  if (allowMaster && [11, 22, 33].includes(num)) return num;
  if (num < 10) return num;
  const sum = String(num).split('').reduce((acc, digit) => {
    const d = parseInt(digit);
    return acc + (isNaN(d) ? 0 : d);
  }, 0);
  return reduceNumber(sum, allowMaster);
};

export const calculateLifePath = (dob) => {
  const [year, month, day] = dob.split('-').map(Number);
  const rYear = reduceNumber(year, false);
  const rMonth = reduceNumber(month, false);
  const rDay = reduceNumber(day, false);
  return reduceNumber(rYear + rMonth + rDay, true);
};

export const calculateNameNumber = (name, type = 'destiny') => {
  const normalized = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z]/g, '');
    
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  
  let filtered = normalized;
  if (type === 'soul') {
    filtered = normalized.split('').filter(char => vowels.includes(char)).join('');
  } else if (type === 'personality') {
    filtered = normalized.split('').filter(char => !vowels.includes(char)).join('');
  }
  
  const sum = filtered.split('').reduce((acc, char) => acc + (charMap[char] || 0), 0);
  return reduceNumber(sum, true);
};

export const calculatePersonalYear = (dob) => {
  const currentYear = new Date().getFullYear();
  const [_, month, day] = dob.split('-').map(Number);
  const rMonth = reduceNumber(month, false);
  const rDay = reduceNumber(day, false);
  const rYear = reduceNumber(currentYear, false);
  return reduceNumber(rMonth + rDay + rYear, true);
};

export const getDetailedAnalysis = (lp, destiny, soul, language = 'vi') => {
  if (language === 'en') {
    return {
      lpText: `Life Path ${lp} shows the main rhythm of your journey. This number describes how you naturally move through challenges, growth, and personal purpose.`,
      destinyText: `Destiny Number ${destiny} points to the role you are learning to embody. It reflects how your talents can become clearer when you act with intention.`,
      advice: `This year, keep your focus practical: choose one priority, refine your habits, and let your energy build steadily instead of scattering it.`
    };
  }

  if (language === 'zh') {
    return {
      lpText: `\u751f\u547d\u9053\u8def\u6570 ${lp} \u663e\u793a\u4f60\u4eba\u751f\u65c5\u7a0b\u7684\u4e3b\u8981\u8282\u594f\u3002\u5b83\u63cf\u8ff0\u4f60\u9762\u5bf9\u6311\u6218\u3001\u6210\u957f\u548c\u4f7f\u547d\u65f6\u7684\u81ea\u7136\u65b9\u5f0f\u3002`,
      destinyText: `\u4f7f\u547d\u6570 ${destiny} \u6307\u5411\u4f60\u6b63\u5728\u5b66\u4e60\u627f\u62c5\u7684\u89d2\u8272\u3002\u5f53\u4f60\u6709\u610f\u8bc6\u5730\u884c\u52a8\u65f6\uff0c\u5929\u8d4b\u4f1a\u53d8\u5f97\u66f4\u6e05\u6670\u3002`,
      advice: `\u4eca\u5e74\u8bf7\u4fdd\u6301\u52a1\u5b9e\uff1a\u9009\u62e9\u4e00\u4e2a\u91cd\u70b9\uff0c\u4fee\u6b63\u4e60\u60ef\uff0c\u8ba9\u80fd\u91cf\u7a33\u5b9a\u79ef\u7d2f\uff0c\u800c\u4e0d\u662f\u5206\u6563\u3002`
    };
  }

  const data = {
    lp: {
      1: "Con đường của bạn là con đường của người tiên phong. Bạn sinh ra để dẫn dắt, khởi xướng và làm chủ vận mệnh của mình. Thử thách lớn nhất là vượt qua cái tôi quá lớn.",
      2: "Bạn mang năng lượng của sự hòa giải và ngoại giao. Con đường của bạn là sự kết nối, thấu cảm và xây dựng sự hòa hợp trong các mối quan hệ.",
      3: "Bạn là hiện thân của sự sáng tạo và niềm vui. Con đường của bạn rực rỡ sắc màu của nghệ thuật và giao tiếp. Hãy cẩn trọng với việc phân tán năng lượng quá mức.",
      4: "Sự kỷ luật và thực tế là kim chỉ nam của bạn. Bạn là người xây dựng nền móng vững chắc. Thách thức là tránh sự cứng nhắc và bảo thủ.",
      5: "Tự do và trải nghiệm là kim chỉ nam của bạn. Bạn không bao giờ đứng yên một chỗ. Cuộc đời bạn là những chuyến đi và sự thay đổi không ngừng.",
      6: "Bạn đi trên con đường của tình yêu thương và trách nhiệm. Bạn là người nuôi dưỡng và chăm sóc gia đình, nhưng cần nhớ yêu thương chính mình.",
      7: "Bạn là nhà thông thái cô độc. Con đường của bạn hướng vào chiều sâu tâm thức, nghiên cứu và triết học. Hãy mở lòng hơn với thế giới bên ngoài.",
      8: "Quyền lực và vật chất là đích đến của bạn. Bạn có khả năng quản lý tài chính và điều hành xuất sắc. Bài học lớn nhất là sự cân bằng giữa tiền bạc và tâm linh.",
      9: "Con đường của lòng nhân ái. Bạn hướng tới những giá trị cộng đồng và nhân đạo. Thách thức là học cách buông bỏ những quá khứ đau thương.",
      11: "Con đường của một bậc thầy tâm linh. Trực giác nhạy bén giúp bạn thấu hiểu những điều vô hình, nhưng cũng dễ mang lại áp lực tinh thần lớn.",
      22: "Bạn là 'Bậc thầy kiến thiết'. Khả năng của bạn là biến những tầm nhìn vĩ đại thành hiện thực, mang lại lợi ích cho số đông.",
      33: "Con đường của sự chữa lành và tình yêu vô điều kiện. Bạn lan tỏa năng lượng chữa lành mạnh mẽ đến thế giới xung quanh."
    },
    destiny: {
      1: "Sứ mệnh của bạn là trở thành người số 1 trong lĩnh vực mình chọn. Bạn phải học cách độc lập và tự tin vào bản sắc riêng.",
      2: "Sứ mệnh của bạn là trở thành cầu nối, mang lại sự hòa bình và thấu hiểu cho những người xung quanh.",
      3: "Sứ mệnh là truyền cảm hứng cho người khác thông qua lời nói, văn chương hoặc nghệ thuật. Thế giới cần nụ cười và trí tuệ của bạn.",
      4: "Bạn mang sứ mệnh thiết lập trật tự và hệ thống, biến những ý tưởng thành nền tảng vững chắc.",
      5: "Sứ mệnh là phá vỡ những rào cản cũ kỹ, mang đến sự đổi mới và linh hoạt cho xã hội.",
      6: "Sứ mệnh của bạn là tạo ra một môi trường ấm áp, an toàn và đầy tình thương cho những người bạn gắn bó.",
      7: "Bạn có sứ mệnh tìm ra những chân lý ẩn giấu và chia sẻ trí tuệ đó với nhân loại.",
      8: "Bạn có trách nhiệm tạo ra sự thịnh vượng không chỉ cho mình mà cho cả cộng đồng thông qua khả năng tổ chức tài ba.",
      9: "Sứ mệnh là người chữa lành tâm hồn, người hướng dẫn tinh thần cho những ai đang lạc lối.",
      11: "Sứ mệnh đánh thức tâm linh người khác bằng chính trực giác và nguồn cảm hứng của mình.",
      22: "Sứ mệnh để lại những di sản mang tính nền tảng và vĩ mô cho thế hệ sau.",
      33: "Sứ mệnh lan tỏa sự vị tha, nâng đỡ những tâm hồn chịu tổn thương."
    }
  };

  return {
    lpText: data.lp[lp] || "Một con số mang năng lượng đặc biệt, đòi hỏi sự kiên trì và khám phá bản thân sâu sắc.",
    destinyText: data.destiny[destiny] || "Bạn mang trong mình trọng trách lớn lao trong việc kết nối và sẻ chia những giá trị tốt đẹp.",
    advice: "Trong năm nay, hãy tập trung vào việc kiện toàn các kế hoạch cá nhân thay vì bắt đầu những dự án mạo hiểm quá lớn."
  };
};
