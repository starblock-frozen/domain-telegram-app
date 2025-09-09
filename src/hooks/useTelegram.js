import { useEffect, useState } from 'react';

const useTelegram = () => {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const app = window.Telegram?.WebApp;
    if (app.initDataUnsafe?.user) {
      app.ready();
      setTg(app);
      setUser(app.initDataUnsafe?.user);
    } else {
      // Example user data for testing in Chrome browser
      const exampleUser = {
        id: "cyber_aladin",
        first_name: "John",
        last_name: "Doe",
        username: "cyber_aladin",
        language_code: "en",
        is_premium: false
      };
      setUser(exampleUser);
    }
  }, []);

  const closeTelegram = () => {
    if (tg?.close) {
      tg.close();
    } else {
      // For testing in browser, just close the window
      window.close();
    }
  };

  const toggleMainButton = (text, show = true) => {
    if (tg?.MainButton) {
      if (show) {
        tg.MainButton.setText(text);
        tg.MainButton.show();
      } else {
        tg.MainButton.hide();
      }
    } else {
      // For testing in browser, log to console
      console.log(`Main Button: ${show ? 'Show' : 'Hide'} - Text: ${text}`);
    }
  };

  return {
    tg,
    user,
    closeTelegram,
    toggleMainButton,
    userId: user?.id,
    username: user?.username || `user_${user?.id}`
  };
};

export default useTelegram;
