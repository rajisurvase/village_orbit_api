import Header from "./Header";
import Footer from "./Footer";
import FeedbackFormWithShare from "./FeedbackFormWithShare";
import VillageChatbot from "./VillageChatbot";

const Layout = ({ children }) => {
  const isChatbotEnabled = import.meta.env.VITE_VILLAGE_ORBIT_CHATBOT==="true";

  return (
    <div>
        <Header />
        {children}
        <Footer />
        <FeedbackFormWithShare />
        {!!isChatbotEnabled && <VillageChatbot />}
    </div>
  );
};

export default Layout;
