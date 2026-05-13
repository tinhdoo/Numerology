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

export const getDetailedAnalysis = (lp, destiny, soul) => {
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