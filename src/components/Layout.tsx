import Header from "./Header";
import Footer from "./Footer";
import FeedbackFormWithShare from "./FeedbackFormWithShare";
import VillageChatbot from "./VillageChatbot";
import { VillageProvider } from "@/context/VillageContextConfig";

const Layout = ({ children }) => {
  return (
    <div>
      <VillageProvider villageName="Shivankhed">
        <Header />
        {children}
        <Footer />
        <FeedbackFormWithShare />
        <VillageChatbot />
      </VillageProvider>
    </div>
  );
};

export default Layout;
