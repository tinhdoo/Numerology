export const westernDeck = [
  { rank: "7", suit: "Cơ", symbol: "♥", color: "red", 
    meaning: "Chỉ về sự nghiệp, nhà cửa, tài sản, đất đai, xe cộ, vàng bạc,… hoặc có việc làm, được mời ăn uống, được tặng quà. Phù hợp bảo hiểm, bất động sản. Nếu chưa có con mà muốn có con thì sẽ có tin vui.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Sự nghiệp ngày càng bền vững, dù thời vận đôi khi không tốt." },
      { cards: ["Bích"], text: "Sự nghiệp dễ phá sản, cơ nghiệp lụn bại." }
    ]
  },
  { rank: "7", suit: "Rô", symbol: "♦", color: "red",
    meaning: "Chỉ việc phù hợp di chuyển, đi đây đi đó, tính toán nhanh nhẹn, tính cách nóng nảy. Thích hợp đầu tư ngắn hạn.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Gia tăng sự tốt đẹp." },
      { cards: ["Bích"], text: "Tiến thoái lưỡng nan, thất nghiệp, cẩn thận đi lại." }
    ]
  },
  { rank: "7", suit: "Chuồn", symbol: "♣", color: "black",
    meaning: "Chỉ việc có lợi lộc hoặc món tiền nhỏ hoặc liên quan nhân quả với các món nợ cho vay.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Thuận lợi về tiền bạc, có thể huy động vốn liếng." },
      { cards: ["Bích"], text: "Dễ bị hao tài nhỏ hoặc khó xoay trở vì trả nợ định kỳ." }
    ]
  },
  { rank: "7", suit: "Bích", symbol: "♠", color: "black",
    meaning: "Chỉ sự xung đột, không hài lòng, bất mãn, cãi vã hoặc việc xấu ngoài dự tính.",
    combinations: [
      { cards: ["7Rô"], text: "Tranh chấp dẫn đến ẩu đả hoặc bị cấp trên khiển trách." },
      { cards: ["Át Bích"], text: "Liên quan đến pháp luật, cảnh tù tội." },
      { cards: ["Bích"], text: "Dễ bị trộm cắp, đánh đập hoặc tai nạn." },
      { cards: ["10Cơ", "Át Cơ"], text: "Mọi việc xấu sẽ được hóa giải nhẹ nhàng." }
    ]
  },
  { rank: "8", suit: "Cơ", symbol: "♥", color: "red",
    meaning: "Chỉ việc thuận lợi, hôn nhân tình duyên tốt đẹp, tiền bạc hanh thông. Cầu con cái sẽ có con gái.",
    combinations: [
      { cards: ["Cơ"], text: "Cầu tình cảm sẽ thành công sớm." },
      { cards: ["Chuồn"], text: "Cầu tiền bạc gặp nhiều thuận lợi." },
      { cards: ["Bích"], text: "Gia đạo gặp nhiều chuyện buồn lo toan." }
    ]
  },
  { rank: "8", suit: "Rô", symbol: "♦", color: "red",
    meaning: "Chỉ việc di chuyển, tính toán nhanh nhẹn. Thích hợp đầu tư ngắn hạn.",
    combinations: [
      { cards: ["8Cơ", "8Chuồn"], text: "Mưu sự thành đạt." },
      { cards: ["8Cơ", "8Bích"], text: "Mưu sự bất thành." }
    ]
  },
  { rank: "8", suit: "Chuồn", symbol: "♣", color: "black",
    meaning: "Người hiền lành, phúc hậu, thiên về tinh thần hơn vật chất. Thích hợp công chức, hành chính.",
    combinations: [
      { cards: ["9Rô", "8Rô"], text: "Mất của tìm lại được, gặp lại người xưa." },
      { cards: ["7Rô"], text: "Khả năng bỏ nhà ra đi hoặc ngoại tình." },
      { cards: ["Bích"], text: "Chuyện tình cảm đau buồn hoặc bất trắc." },
      { cards: ["8Bích"], text: "Công việc dang dở, tình cảm tan vỡ." }
    ]
  },
  { rank: "8", suit: "Bích", symbol: "♠", color: "black",
    meaning: "Thiệt hại, thua lỗ, bệnh tật hoặc tiểu nhân chơi xấu.",
    combinations: [
      { cards: ["8Cơ", "8Rô"], text: "Mưu sự bất thành." },
      { cards: ["Bích"], text: "Bị tiểu nhân ám hại hoặc bệnh nan y." },
      { cards: ["Át Bích"], text: "Bị trù dập, ma ám hoặc có vong linh theo hộ." },
      { cards: ["10Cơ", "Át Cơ"], text: "Hóa giải tai ách." }
    ]
  },
  { rank: "9", suit: "Cơ", symbol: "♥", color: "red",
    meaning: "Thời cơ thuận lợi nhưng ít gặp nhau. Thích hợp CNTT, quảng cáo. Có sự phò trợ linh thiêng.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Thời vận tốt đẹp, đặc biệt là tiền bạc." },
      { cards: ["Bích"], text: "Không nên đầu tư lớn, dễ gặp họa hại." }
    ]
  },
  { rank: "9", suit: "Rô", symbol: "♦", color: "red",
    meaning: "Thay đổi công danh hoặc nơi ở, đi xa, du lịch.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Thay đổi tốt đẹp ở nước ngoài." },
      { cards: ["Bích"], text: "Khó xoay trở, không nên đi xa." }
    ]
  },
  { rank: "9", suit: "Chuồn", symbol: "♣", color: "black",
    meaning: "Lộc đến bất ngờ, tiền trợ cấp, trúng số.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Kiếm tiền dễ dàng, trúng số." },
      { cards: ["Bích"], text: "Hao tài, mất tiền không lấy lại được." }
    ]
  },
  { rank: "9", suit: "Bích", symbol: "♠", color: "black",
    meaning: "Cảnh tuyệt giao, chia ly hoặc kết thúc.",
    combinations: [
      { cards: ["Át Bích ngược"], text: "Cảnh chết chóc, có tang hoặc thua lỗ nặng." },
      { cards: ["Át Bích xuôi"], text: "Biệt vô âm tín, tin tức xấu." }
    ]
  },
  { rank: "10", suit: "Cơ", symbol: "♥", color: "red",
    meaning: "Thuận lợi, tình cảm tốt đẹp, hóa giải tai nạn bệnh tật.",
    combinations: [
      { cards: ["Bích"], text: "Cơ hội giải hóa không có, nên tạo phúc đức." },
      { cards: ["9Bích"], text: "Khó vượt qua tai nạn." }
    ]
  },
  { rank: "10", suit: "Rô", symbol: "♦", color: "red",
    meaning: "Thay đổi chỗ ở, đoàn tụ, phù hợp nghề giải trí.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Cuộc đổi đời tốt đẹp." },
      { cards: ["Bích"], text: "Vui buồn lẫn lộn, nghe tin xấu." }
    ]
  },
  { rank: "10", suit: "Chuồn", symbol: "♣", color: "black",
    meaning: "Có tiền do chính bàn tay khối óc tạo ra.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Thuận lợi về tiền bạc, kiếm tiền dễ dàng." },
      { cards: ["Bích"], text: "Hao tài, thua vốn hoặc bị kẹt vốn." }
    ]
  },
  { rank: "10", suit: "Bích", symbol: "♠", color: "black",
    meaning: "Buồn phiền vì chờ đợi lâu ngày chưa thấy kết quả.",
    combinations: [
      { cards: ["Bích"], text: "Gia tăng việc xấu." },
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Giảm việc tốt đẹp của các lá bài này." }
    ]
  },
  { rank: "Bồi", suit: "Cơ", symbol: "♥", color: "red",
    meaning: "Người lương thiện, nhân hậu. Phù hợp văn chương, giáo dục.",
    combinations: [
      { cards: ["9Rô", "8Rô"], text: "Mất của tìm lại được, người xưa quay về." },
      { cards: ["Bích"], text: "Chuyện tình cảm không hài lòng." },
      { cards: ["8Bích", "Đầm Bích"], text: "Công việc dang dở, tình cảm tan rã." }
    ]
  },
  { rank: "Bồi", suit: "Rô", symbol: "♦", color: "red",
    meaning: "Di chuyển nhiều, thích biến động, du lịch.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Gia tăng điều tốt đẹp." },
      { cards: ["Bích"], text: "Sự việc khó xoay trở, cẩn thận đi lại." }
    ]
  },
  { rank: "Bồi", suit: "Chuồn", symbol: "♣", color: "black",
    meaning: "Thuận lợi tiền bạc nhỏ, tự tay làm ra tiền.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Tiền bạc thuận lợi, làm ăn tốt đẹp." },
      { cards: ["Bích"], text: "Hao tài, đầu tư lớn dễ phá sản." }
    ]
  },
  { rank: "Bồi", suit: "Bích", symbol: "♠", color: "black",
    meaning: "Thời vận lụn bại, trắc trở, tiểu nhân ám hại.",
    combinations: [
      { cards: ["Bích"], text: "Gia tăng sự xấu." },
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Giảm sự tốt của các lá bài này." }
    ]
  },
  { rank: "Đầm", suit: "Cơ", symbol: "♥", color: "red",
    meaning: "Thuận lợi tình cảm, tiền bạc tốt.",
    combinations: [
      { cards: ["9Rô", "8Rô"], text: "Mất của tìm lại được." },
      { cards: ["7Rô"], text: "Bỏ nhà ra đi vội vã." },
      { cards: ["Bích"], text: "Chuyện tình cảm đau buồn." }
    ]
  },
  { rank: "Đầm", suit: "Rô", symbol: "♦", color: "red",
    meaning: "Nóng nảy, ăn ngay nói thẳng, nặng vật chất.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Gia tăng tốt đẹp." },
      { cards: ["Bích"], text: "Mọi sự khó xoay trở." }
    ]
  },
  { rank: "Đầm", suit: "Chuồn", symbol: "♣", color: "black",
    meaning: "Thịnh vượng về tiền bạc, biết tạo ra tiền.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Thuận lợi tiền bạc, kiếm tiền dễ." },
      { cards: ["Bích"], text: "Hao tài, thời vận xấu, tránh đầu tư lớn." }
    ]
  },
  { rank: "Đầm", suit: "Bích", symbol: "♠", color: "black",
    meaning: "Gặp trở ngại, thời vận xấu. Phù hợp luật sư, bác sĩ.",
    combinations: [
      { cards: ["Bích"], text: "Gia tăng sự xấu." },
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Giảm việc tốt." }
    ]
  },
  { rank: "Già", suit: "Cơ", symbol: "♥", color: "red",
    meaning: "Người độ lượng, hiền hòa, có sự nghiệp lớn.",
    combinations: [
      { cards: ["9Rô", "8Rô"], text: "Mất của tìm lại được." },
      { cards: ["Bích"], text: "Nên cẩn trọng đề phòng bất trắc." }
    ]
  },
  { rank: "Già", suit: "Rô", symbol: "♦", color: "red",
    meaning: "Cứng rắn, nghiêm khắc, quân sự, cảnh sát.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Gia tăng tốt đẹp." },
      { cards: ["Bích"], text: "Tiến thoái lưỡng nan." }
    ]
  },
  { rank: "Già", suit: "Chuồn", symbol: "♣", color: "black",
    meaning: "Tiền bạc thịnh vượng, uy quyền, giàu có.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Làm ăn phát đạt." },
      { cards: ["Bích"], text: "Thời bại, tránh đầu tư lớn." }
    ]
  },
  { rank: "Già", suit: "Bích", symbol: "♠", color: "black",
    meaning: "Thời vận xấu, tai nạn, pháp luật.",
    combinations: [
      { cards: ["Bích"], text: "Gia tăng sự xấu." },
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Giảm điều tốt." }
    ]
  },
  { rank: "Át", suit: "Cơ", symbol: "♥", color: "red",
    meaningUpright: "Mọi việc thuận lợi, hưởng phúc đức tổ tiên.",
    meaningReversed: "Thuận lợi đang chờ, cần đợi thời cơ. Phúc đức suy giảm.",
    combinations: [
      { cards: ["Bích"], text: "Phúc đức đã hết, cơ hội hóa giải không có." },
      { cards: ["9Bích"], text: "Khó vượt qua tai nạn." }
    ]
  },
  { rank: "Át", suit: "Rô", symbol: "♦", color: "red",
    meaning: "Thư từ, văn tự, hợp đồng, uy tín.",
    combinations: [
      { cards: ["Cơ", "Rô", "Chuồn"], text: "Nhiều tin tốt đẹp." },
      { cards: ["Bích"], text: "Tin tức xấu, tin buồn, tiểu nhân tung tin." }
    ]
  },
  { rank: "Át", suit: "Chuồn", symbol: "♣", color: "black",
    meaningUpright: "Buồn rầu, thất vọng về nội tâm.",
    meaningReversed: "Tiền bạc vay mượn, nhân quả nợ nần.",
    combinations: [
      { cards: ["9Bích"], text: "Tin tức bị biệt vô âm tín." },
      { cards: ["Bích"], text: "Gia tăng độ xấu / Khốn đốn vì nợ nần." }
    ]
  },
  { rank: "Át", suit: "Bích", symbol: "♠", color: "black",
    meaningUpright: "Buồn rầu, thất vọng, phiền muộn khó thổ lộ.",
    meaningReversed: "Xui xẻo, tai nạn, tù tội, tang chế.",
    combinations: [
      { cards: ["Bích"], text: "Gia tăng độ xấu." },
      { cards: ["8Bích"], text: "Bị ám hại hoặc có vong theo." },
      { cards: ["9Bích"], text: "Chết chóc hoặc thua lỗ tiêu tan sự nghiệp." },
      { cards: ["7Bích"], text: "Bị pháp luật đe dọa, tù tội." }
    ]
  }
];
