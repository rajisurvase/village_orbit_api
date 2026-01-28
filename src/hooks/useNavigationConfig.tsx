import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NavMenuItem {
  id: string;
  key: string;
  label: {
    en: string;
    hi: string;
    mr: string;
  };
  href: string;
  pageKey: string;
  isVisible: boolean;
  order: number;
}

export interface HomeMenuSection {
  id: string;
  title: {
    en: string;
    hi: string;
    mr: string;
  };
  items: NavMenuItem[];
  isVisible: boolean;
  order: number;
}

export interface NavigationConfig {
  standaloneItems: NavMenuItem[];
  homeMenuSections: HomeMenuSection[];
}

// Default navigation configuration
export const getDefaultNavigationConfig = (): NavigationConfig => ({
  standaloneItems: [
    { id: "notices", key: "notices", label: { en: "Notices", hi: "सूचनाएं", mr: "सूचना" }, href: "/notices", pageKey: "notices", isVisible: true, order: 1 },
    { id: "market_prices", key: "market_prices", label: { en: "Market Prices", hi: "बाजार भाव", mr: "बाजार भाव" }, href: "/market-prices", pageKey: "market_prices", isVisible: true, order: 2 },
    { id: "buy_sell", key: "buy_sell", label: { en: "Buy & Sell", hi: "खरीदें और बेचें", mr: "खरेदी विक्री" }, href: "/buy-sell", pageKey: "buy_sell", isVisible: true, order: 3 },
    { id: "exam", key: "exam", label: { en: "Online Exam", hi: "ऑनलाइन परीक्षा", mr: "ऑनलाइन परीक्षा" }, href: "/exam", pageKey: "exam", isVisible: true, order: 4 },
    { id: "forum", key: "forum", label: { en: "Forum", hi: "मंच", mr: "मंच" }, href: "/forum", pageKey: "forum", isVisible: true, order: 5 },
    { id: "tax_payment", key: "tax_payment", label: { en: "Pay Taxes", hi: "कर भुगतान", mr: "कर भरा" }, href: "/tax-payment", pageKey: "tax_payment", isVisible: true, order: 6 },
    { id: "contact", key: "contact", label: { en: "Contact", hi: "संपर्क", mr: "संपर्क" }, href: "/contact-us", pageKey: "contact", isVisible: true, order: 7 },
  ],
  homeMenuSections: [
    {
      id: "about_village",
      title: { en: "About Village", hi: "गाँव के बारे में", mr: "गावाबद्दल" },
      isVisible: true,
      order: 1,
      items: [
        { id: "village_map", key: "village_map", label: { en: "Village Map", hi: "गाँव का नक्शा", mr: "गावाचा नकाशा" }, href: "/about#map", pageKey: "about", isVisible: true, order: 1 },
        { id: "images_gallery", key: "images_gallery", label: { en: "Images", hi: "फोटो", mr: "फोटो" }, href: "/media-gallery?type=images", pageKey: "gallery", isVisible: true, order: 2 },
        { id: "videos_gallery", key: "videos_gallery", label: { en: "Videos", hi: "वीडियो", mr: "व्हिडिओ" }, href: "/media-gallery?type=videos", pageKey: "gallery", isVisible: true, order: 3 },
      ]
    },
    {
      id: "government",
      title: { en: "Government & Administration", hi: "सरकार और प्रशासन", mr: "शासन आणि प्रशासन" },
      isVisible: true,
      order: 2,
      items: [
        { id: "panchayat_reps", key: "panchayat_reps", label: { en: "Panchayat Representatives", hi: "पंचायत प्रतिनिधि", mr: "पंचायत प्रतिनिधी" }, href: "/panchayat", pageKey: "panchayat", isVisible: true, order: 1 },
        { id: "ward_members", key: "ward_members", label: { en: "Ward Members", hi: "वार्ड सदस्य", mr: "वॉर्ड सदस्य" }, href: "/panchayat#ward", pageKey: "panchayat", isVisible: true, order: 2 },
        { id: "panchayat_staff", key: "panchayat_staff", label: { en: "Panchayat Staff", hi: "पंचायत कर्मचारी", mr: "पंचायत कर्मचारी" }, href: "/panchayat#staff", pageKey: "panchayat", isVisible: true, order: 3 },
        { id: "govt_staff", key: "govt_staff", label: { en: "Government Staff", hi: "सरकारी कर्मचारी", mr: "शासकीय कर्मचारी" }, href: "/panchayat#govt", pageKey: "panchayat", isVisible: true, order: 4 },
        { id: "govt_schemes", key: "govt_schemes", label: { en: "Government Schemes", hi: "शासकीय योजनाएं", mr: "शासकीय योजना" }, href: "/govt-schemes", pageKey: "govt_schemes", isVisible: true, order: 5 },
        { id: "beneficiary_schemes", key: "beneficiary_schemes", label: { en: "Beneficiary Schemes", hi: "लाभार्थी योजनाएं", mr: "लाभार्थी योजना" }, href: "/govt-schemes?tab=beneficiary", pageKey: "govt_schemes", isVisible: true, order: 6 },
      ]
    },
    {
      id: "services",
      title: { en: "Services", hi: "सेवाएं", mr: "सेवा" },
      isVisible: true,
      order: 3,
      items: [
        { id: "shops", key: "shops", label: { en: "Shops / Business", hi: "दुकानें / व्यापार", mr: "दुकाने / व्यवसाय" }, href: "/services#shops", pageKey: "services", isVisible: true, order: 1 },
        { id: "health", key: "health", label: { en: "Health", hi: "स्वास्थ्य", mr: "आरोग्य" }, href: "/services#health", pageKey: "services", isVisible: true, order: 2 },
        { id: "education", key: "education", label: { en: "Education", hi: "शिक्षा", mr: "शिक्षण" }, href: "/services#education", pageKey: "services", isVisible: true, order: 3 },
        { id: "transport", key: "transport", label: { en: "Transportation", hi: "परिवहन", mr: "वाहतूक" }, href: "/services#transport", pageKey: "services", isVisible: true, order: 4 },
        { id: "food", key: "food", label: { en: "Food & Dining", hi: "खान-पान", mr: "खाद्य आणि भोजन" }, href: "/services#food", pageKey: "services", isVisible: true, order: 5 },
      ]
    },
    {
      id: "women_child",
      title: { en: "Women & Child Care", hi: "महिला और बाल देखभाल", mr: "महिला आणि बाल काळजी" },
      isVisible: true,
      order: 4,
      items: [
        { id: "asha", key: "asha", label: { en: "Asha Workers", hi: "आशा कार्यकर्ता", mr: "आशा कार्यकर्त्या" }, href: "/#asha", pageKey: "people", isVisible: true, order: 1 },
        { id: "anganwadi", key: "anganwadi", label: { en: "Anganwadi Karyakarta", hi: "आंगनवाड़ी कार्यकर्ता", mr: "अंगणवाडी कार्यकर्त्या" }, href: "/#anganwadi", pageKey: "people", isVisible: true, order: 2 },
      ]
    },
    {
      id: "documents",
      title: { en: "Documents & Certificates", hi: "दस्तावेज और प्रमाण पत्र", mr: "कागदपत्रे आणि प्रमाणपत्रे" },
      isVisible: true,
      order: 5,
      items: [
        { id: "birth_cert", key: "birth_cert", label: { en: "Birth Certificate", hi: "जन्म प्रमाण पत्र", mr: "जन्म दाखला" }, href: "/contact-us?service=birth-certificate", pageKey: "contact", isVisible: true, order: 1 },
        { id: "death_cert", key: "death_cert", label: { en: "Death Certificate", hi: "मृत्यु प्रमाण पत्र", mr: "मृत्यू दाखला" }, href: "/contact-us?service=death-certificate", pageKey: "contact", isVisible: true, order: 2 },
        { id: "property_tax", key: "property_tax", label: { en: "Property Tax Form", hi: "संपत्ति कर फॉर्म", mr: "मालमत्ता कर फॉर्म" }, href: "/contact-us?service=property-tax", pageKey: "contact", isVisible: true, order: 3 },
       // { id: "rti", key: "rti", label: { en: "RTI Application", hi: "आरटीआई आवेदन", mr: "माहितीचा अधिकार अर्ज" }, href: "/contact-us?service=rti-application", pageKey: "contact", isVisible: true, order: 4 },
       // { id: "gram_sabha", key: "gram_sabha", label: { en: "Gram Sabha Resolution", hi: "ग्राम सभा प्रस्ताव", mr: "ग्रामसभा ठराव" }, href: "/contact-us?service=gram-sabha", pageKey: "contact", isVisible: true, order: 5 },
      ]
    }
  ]
});

export const useNavigationConfig = (villageId?: string) => {
  const [config, setConfig] = useState<NavigationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNavConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!villageId) {
          setConfig(getDefaultNavigationConfig());
          setLoading(false);
          return;
        }

        // Fetch navigation config from village_config
        const { data: configData, error: configError } = await supabase
          .from("village_config")
          .select("config_data")
          .eq("village_id", villageId)
          .eq("language", "en") // Navigation config is language-independent, stored with en
          .maybeSingle();

        if (configError) {
          console.error("Error fetching nav config:", configError);
          setConfig(getDefaultNavigationConfig());
        } else if (configData?.config_data) {
          const data = configData.config_data as any;
          if (data.navigationConfig) {
            setConfig(data.navigationConfig);
          } else {
            setConfig(getDefaultNavigationConfig());
          }
        } else {
          setConfig(getDefaultNavigationConfig());
        }
      } catch (err) {
        console.error("Error in fetchNavConfig:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setConfig(getDefaultNavigationConfig());
      } finally {
        setLoading(false);
      }
    };

    fetchNavConfig();

    // Set up real-time subscription for navigation config updates
    const channel = supabase
      .channel("nav-config-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "village_config",
        },
        (payload) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            const newData = payload.new as any;
            if (newData.config_data?.navigationConfig) {
              setConfig(newData.config_data.navigationConfig);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [villageId]);

  return { config, loading, error };
};
