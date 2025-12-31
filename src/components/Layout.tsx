import Header from "./Header";
import Footer from "./Footer";
import FeedbackForm from "./FeedbackForm";
import VillageChatbot from "./VillageChatbot";
import { VillageProvider } from "@/context/VillageContextConfig";

const Layout = ({ children }) => {
  return (
    <div>
      <VillageProvider villageName="Shivankhed">
        <Header />
        {children}
        <Footer />
        <FeedbackForm />
        <VillageChatbot />
      </VillageProvider>
    </div>
  );
};

export default Layout;
