
const pdftemplated = (contentWidth,dto) => {
    return `
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Open+Sans:wght@300;400;700&display=swap');
          body {
            font-family: 'Open Sans', sans-serif;
            background: url('https://media.istockphoto.com/id/1127245421/photo/woman-hands-praying-for-blessing-from-god-on-sunset-background.jpg?s=612x612&w=0&k=20&c=dTR8aj0xt7DLhxS9vogRbwY8VIg9U4AzkpB_iTTyr10=') no-repeat center center;
            background-size: cover;
            padding: 80px 0;
            color: #333;
            text-align: center;
          }
          .container {
            width: ${contentWidth}px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .title {
            font-family: 'Great Vibes', cursive;
            font-size: 36px;
            color: #800080;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 18px;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            margin: 20px 0;
          }
          .signature {
            font-size: 18px;
            color: #800080;
            font-weight: bold;
            margin-top: 30px;
          }
          .photo {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 50%;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">${dto.coupleName} Invite</div>
          <div class="subtitle">You're invited on ${dto.date}</div>
          <div class="message">${dto.message}</div>
          <div class="signature">${dto.signature}</div>
          ${
            dto.imageUrl
              ? `<img src="${dto.imageUrl}" class="photo" alt="Invitation Image" />`
              : ''
          }
        </div>
      </body>
    </html>
  `;
}