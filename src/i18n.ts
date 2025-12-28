import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Header
      "header.title": "Shivankhed (Khurd)",
      "header.about": "About",
      "header.services": "Services", 
      "header.panchayat": "Panchayat",
      "header.contact": "Contact",
      // Header – Auth / Navigation
"header.home": "Home",
"header.admin": "Admin",
"header.myProfile": "My Profile",
"header.login": "Login",
"header.adminDashboard": "Admin Dashboard",
"header.logout": "Logout",

      
      // Hero
      "hero.title": "Welcome to Shivankhed (Khurd) Village",
      "hero.subtitle": "A Progressive Village in Latur District, Maharashtra",
      "hero.description": "Discover our vibrant community, rich culture, and development initiatives that make Shivankhed (Khurd) a model village in rural Maharashtra.",
      "hero.explore": "Explore Village",
      "hero.contact": "Contact Panchayat",
      
      // About
      "about.title": "About Our Village",
      "about.description": "Discover the rich heritage, vibrant culture, and progressive development of Shivankhed (Khurd) village.",
      "about.location": "Location & Geography",
      "about.population": "Demographics",
      "about.culture": "Culture & Traditions",
      "about.established": "Established",
      
      // Announcements
      "announcements.title": "Latest Announcements",
      "announcements.description": "Stay updated with important notices, meeting schedules, and development updates from your Gram Panchayat.",
      "announcements.published": "Published",
      "announcements.addToCalendar": "Add to Calendar",
      "announcements.stayUpdated": "Stay Updated",
      "announcements.neverMiss": "Never miss important announcements from your Gram Panchayat. Get notified about meetings, schemes, and development updates.",
      "announcements.whatsapp": "WhatsApp Updates",
      "announcements.joinGroup": "Join community group",
      "announcements.noticeBoard": "Notice Board",
      "announcements.visitOffice": "Visit Panchayat office",
      "announcements.contactUpdates": "Contact for Updates",

         // Media Gallery
  "mediaGallery.title": "Media Gallery",
  "mediaGallery.subtitle": "Browse photos and videos of festivals, development work and community events.",
  "mediaGallery.photosTab": "Photo Gallery",
  "mediaGallery.videosTab": "Video Gallery",
  "mediaGallery.filterAll": "All",
  "mediaGallery.noPhotosTitle": "No Photos Available",
  "mediaGallery.noPhotosText": "Gallery photos will be updated soon.",
  "mediaGallery.noVideosTitle": "No Videos Available",
  "mediaGallery.noVideosText": "Video gallery will be updated soon.",
  "mediaGallery.seoImageTitle": "Photo Gallery",
  "mediaGallery.seoVideoTitle": "Video Gallery",
  "mediaGallery.seoDescription": "View the official village media gallery — photos and videos",

    



      // Gov Staff Section
      "govstaff.title": "Government Staff",
      "govstaff.description": "Government officials working for the welfare and development of our village",
      
      // Panchayat
      "panchayat.title": "Panchayat Representatives",
      "panchayat.description": "Meet our elected representatives who work tirelessly for the development and welfare of our village community.",
      "panchayat.sarpanch": "Sarpanch",
      "panchayat.wardMembers": "Ward Members",
      "panchayat.secretary": "Panchayat Secretary",
      "panchayat.staff": "Panchayat Staff",
      "panchayat.tenure": "Tenure",
      "panchayat.message": "Working together for the prosperity and development of our beloved village community.",
      "panchayat.officeHours": "Office Hours",
      "panchayat.responsibilities": "Panchayat Responsibilities",
      
      // Services
      "services.title": "Village Services",
      "services.description": "Discover all the essential services available in our village community, from local businesses to healthcare and education.",
      "services.owner": "Owner",
      "services.doctor": "Doctor",
      "services.teacher": "Teacher", 
      "services.pujari": "Pujari",
      
      "services.category.retailsgrocery": "Retail & Grocery",
      "services.category.transportation": "Transportation",
      "services.category.religiousservices": "Religious Services",
      "services.category.education": "Education",
      "services.category.fooddining": "Food & Dining",
      "services.category.healthcare": "Healthcare",
      
      // Schemes
      "schemes.title": "Government Schemes & Services",
      "schemes.description": "Accessss various government schemes and services designed for rural community development.",
      "schemes.benefits": "Benefits",
      "schemes.eligibility": "Eligibility",
      "schemes.process": "Application Process",
      "schemes.applyNow": "Apply Now",
      "schemes.learnMore": "Learn More",
      "schemes.needHelp": "Need Help with Applications?",
      "schemes.helpDescription": "Our Panchayat office provides free assistance for scheme applications, document verification, and status tracking. Visit during office hours or call for appointment.",
      "schemes.phoneSupport": "Phone Support",
      "schemes.inPersonHelp": "In-Person Help",
      "schemes.documentHelp": "Document Help",
      "schemes.freeVerification": "Free Verification",
      "schemes.downloadForms": "Download Forms",
      "schemes.contactOffice": "Contact Office",
      
      // Development
      "development.title": "Development Works",
      "development.description": "Track the progress of various development projects undertaken in our village.",
      "development.summary": "Development Summary",
      "development.completed": "Completed Projects",
      "development.ongoing": "Ongoing Projects", 
      "development.planned": "Planned Projects",
      "development.totalInvestment": "Total Investment",
      "development.budget": "Budget",
      "development.timeline": "Timeline",
      "development.progress": "Progress",
      "development.startDate": "Start Date",
      "development.completionDate": "Completed",
      "development.expectedCompletion": "Expected Completion",
      "development.projectBudget": "Project Budget",
      "development.status": "Status",
      "development.statusCompleted": "Project successfully completed on schedule",
      "development.statusOngoing": "Work in progress - Regular updates available at Panchayat office",
      "development.statusPlanned": "Project approved - Implementation starting soon",
      

      // Proud People
"proud-peopleWorkers.title": "Proud of Our People",
"proud-peopleWorkers.description":
  "Celebrating individuals who have made our village proud through their achievements and contributions",


//asha worker 
  "ashaWorkers.title": "ASHA Workers",
  "ashaWorkers.description": "Accredited Social Health Activists who provide essential primary healthcare services, promote maternal and child health, and support community well-being at the village level.",
//anganwadi worker 
  "anganwadiWorkers.title": "Anganwadi Workers",
  "anganwadiWorkers.description": "Frontline workers responsible for child nutrition, early childhood education, health awareness, and the welfare of women and children in the village.",



  // Development Works
"developmentWorks.title": "Development Works",
"developmentWorks.description":
  "Track the progress of ongoing and completed development projects that enhance infrastructure and improve quality of life in our village.",

  
      // Gallery
      "gallery.title": "Village Gallery",
      "gallery.description": "Explore memorable moments from our village life, festivals, development projects, and community events that showcase our rich heritage and progress.",
      "gallery.categories": "Gallery Categories",
      "gallery.viewAll": "View All",
      "gallery.photo": "photo",
      "gallery.photos": "photos",
      "gallery.shareYourMoments": "Share Your Village Moments",
      "gallery.uploadDescription": "Have photos or videos from village events? Share them with us to be featured in our community gallery. Help us document our village's journey and celebrate our achievements together.",
      "gallery.acceptedTypes": "Photos & Videos Welcome",
      "gallery.moderation": "Community Moderated",
      //notices board 
     
  "notices.title": "Notice Board",
  "notices.subtitle": "Latest official notices and announcements",
  "notices.metaDescription": "View the latest official notices and announcements from the Gram Panchayat.",

  "notices.search": "Search notices...",
  "notices.none": "No notices available",
  "notices.checkBack": "Please check back later",

  "notices.category": "Category",
  "notices.date": "Date",
  "notices.readMore": "Read More",
  "notices.attachment": "View Attachment",
  "notices.viewAttachment": "Open Attachment",

  "notices.active": "Active",
  "notices.inactive": "Expired Notice",

  "notices.all": "All",
  "notices.general": "General",
  "notices.meeting": "Meeting",
  "notices.urgent": "Urgent",
  "notices.tender": "Tender",
  "notices.scheme": "Scheme",
  "notices.election": "Election",

      // Contact
      "contact.title": "Contact Us",
      "contact.description": "Get in touch with your Gram Panchayat for any queries, complaints, or assistance with government services and village development matters.",
      "contact.office": "Panchayat Office",
      "contact.emergency": "Emergency Contacts",
      "contact.getDirections": "Get Directions",
      "contact.sendMessage": "Send a Message",
      "contact.name": "Full Name",
      "contact.phone": "Phone Number",
      "contact.email": "Email Address",
      "contact.subject": "Subject",
      "contact.message": "Message",
      "contact.submit": "Send Message",
      "contact.quickServices": "Quick Services",
      "contact.apply": "Apply",
      "contact.officeHours": "Office Hours",
      "contact.phone2": "Phone",
      "contact.email2": "Email",
      "contact.urgentNote": "For urgent matters, please call our office directly. We aim to respond to all messages within 2-3 business days.",
      "contact.enterName": "Enter your full name",
      "contact.enterPhone": "Enter your phone number",
      "contact.enterEmail": "Enter your email address",
      "contact.enterSubject": "What is this regarding?",
      "contact.enterMessage": "Please describe your query, complaint, or suggestion in detail...",
      "contact.police": "Police",
      "contact.fire": "Fire",
      "contact.ambulance": "Ambulance",
      "contact.localEmergency": "Local Emergency",
   
      // Footer
      "footer.aboutDescription": "A progressive village committed to sustainable development, transparent governance, and inclusive growth for all residents.",
      "footer.quickLinks": "Quick Links",
      "footer.aboutVillage": "About Village",
      "footer.panchayatMembers": "Panchayat Members",
      "footer.governmentSchemes": "Government Schemes",
      "footer.developmentWorks": "Development Works",
      "footer.services": "Services",
      "footer.birthCertificate": "Birth Certificate",
      "footer.deathCertificate": "Death Certificate",
      "footer.propertyTax": "Property Tax",
      "footer.rtiApplication": "RTI Application",
      "footer.gramSbhaResolution": "Gram Sabha Resolution 2024",
      "footer.contactInfo": "Contact Info",
      "footer.followUs": "Follow Us",
      "footer.copyright": "© {{year}} {{village}}. All rights reserved.",
      "footer.tagline": "Developed for transparent and efficient rural governance",
      "footer.privacyPolicy": "Privacy Policy",
      "footer.termsOfService": "Terms of Service",
      "footer.rtiGuidelines": "RTI Guidelines",
      "footer.officialLinks": "Official Links",
      
      // Common
      "common.district": "District",
      "common.state": "State",
      "common.readMore": "Read More",
      "common.viewDetails": "View Details",
      "common.close": "Close",
      "common.loading": "Loading...",
      "common.today": "Today",
      "common.yesterday": "Yesterday",
      "common.tomorrow": "Tomorrow",
      "common.high": "High",
      "common.medium": "Medium", 
      "common.low": "Low",
      "common.coordinates": "Coordinates",
      "common.altitude": "Altitude",
      "common.area": "Area",
      "common.totalPopulation": "Total Population",
      "common.malePopulation": "Male Population",
      "common.femalePopulation": "Female Population",
      "common.literacyRate": "Literacy Rate",
      "common.genderRatio": "Gender Ratio",
      "common.femalesPerMales": "females per 1000 males",
      "common.progressiveValues": "Above national average, reflecting progressive social values",
      "common.administrativeDetails": "Administrative Details",
      "common.pinCode": "PIN Code",
      "common.ward": "Ward",
      "common.department": "Department",
      "common.position": "Position",
      "common.responsibilities": "Responsibilities",

       // news ticker 
      "news.latest" : "Latest News"
    }
  },
  hi: {
    translation: {
      // Header
      "header.title": "शिवनखेड (खु)",
      "header.about": "हमारे बारे में",
      "header.services": "सेवाएं",
      "header.panchayat": "पंचायत",
      "header.contact": "संपर्क",

        // Header – Auth / Navigation
    "header.home": "होम",
    "header.admin": "प्रशासक",
    "header.myProfile": "मेरी प्रोफ़ाइल",
    "header.login": "लॉगिन",
    "header.adminDashboard": "एडमिन डैशबोर्ड",
    "header.logout": "लॉगआउट",


      // Media Gallery (Hindi)
  "mediaGallery.title": "मीडिया गैलरी",
  "mediaGallery.subtitle": "गाँव के त्योहारों, विकास कार्यों और सामुदायिक कार्यक्रमों की तस्वीरें और वीडियो देखें।",
  "mediaGallery.photosTab": "फोटो गैलरी",
  "mediaGallery.videosTab": "वीडियो गैलरी",
  "mediaGallery.filterAll": "सभी",
  "mediaGallery.noPhotosTitle": "कोई फोटो उपलब्ध नहीं",
  "mediaGallery.noPhotosText": "गैलरी फोटो जल्द ही अपडेट किए जाएंगे।",
  "mediaGallery.noVideosTitle": "कोई वीडियो उपलब्ध नहीं",
  "mediaGallery.noVideosText": "वीडियो गैलरी जल्द ही अपडेट की जाएगी।",
  "mediaGallery.seoImageTitle": "फोटो गैलरी",
  "mediaGallery.seoVideoTitle": "वीडियो गैलरी",
  "mediaGallery.seoDescription": "हमारे गाँव की मीडिया गैलरी — फोटो और वीडियो देखें",

      
      // Hero
      "hero.title": "शिवनखेड (खु) गांव में आपका स्वागत है",
      "hero.subtitle": "लातूर जिला, महाराष्ट्र में एक प्रगतिशील गांव",
      "hero.description": "हमारे जीवंत समुदाय, समृद्ध संस्कृति और विकास पहलों की खोज करें जो शिवनखेड (खु) को ग्रामीण महाराष्ट्र में एक आदर्श गांव बनाते हैं।",
      "hero.explore": "गांव देखें",
      "hero.contact": "पंचायत संपर्क",

         // Gov Staff Section
      "govstaff.title": "सरकारी कर्मचारी",
"govstaff.description": "हमारे गांव के विकास और कल्याण के लिए कार्य करने वाले सरकारी अधिकारी",

      // About
      "about.title": "हमारे गांव के बारे में",
      "about.description": "शिवनखेड (खु) गांव की समृद्ध विरासत, जीवंत संस्कृति और प्रगतिशील विकास की खोज करें।",
      "about.location": "स्थान और भूगोल",
      "about.population": "जनसांख्यिकी",
      "about.culture": "संस्कृति और परंपराएं",
      "about.established": "स्थापित",
      
      // Announcements
      "announcements.title": "नवीनतम घोषणाएं",
      "announcements.description": "अपने ग्राम पंचायत से महत्वपूर्ण सूचनाओं, बैठक कार्यक्रम और विकास अपडेट के साथ अपडेट रहें।",
      "announcements.published": "प्रकाशित",
      "announcements.addToCalendar": "कैलेंडर में जोड़ें",
      "announcements.stayUpdated": "अपडेट रहें",
      "announcements.neverMiss": "अपने ग्राम पंचायत की महत्वपूर्ण घोषणाओं को कभी न चूकें। बैठकों, योजनाओं और विकास अपडेट की सूचना प्राप्त करें।",
      "announcements.whatsapp": "व्हाट्सऐप अपडेट",
      "announcements.joinGroup": "समुदायिक समूह में शामिल हों",
      "announcements.noticeBoard": "नोटिस बोर्ड",
      "announcements.visitOffice": "पंचायत कार्यालय जाएं",
      "announcements.contactUpdates": "अपडेट के लिए संपर्क करें",
      
      // Panchayat
      "panchayat.title": "पंचायत प्रतिनिधि",
      "panchayat.description":"हमारे गांव के विकास और कल्याण के लिए निरंतर कार्य करने वाले हमारे चुने हुए प्रतिनिधियों से मिलिए।",
      "panchayat.sarpanch": "सरपंच",
      "panchayat.wardMembers": "वार्ड सदस्य",
      "panchayat.secretary": "पंचायत सचिव",
      "panchayat.staff": "पंचायत कर्मचारी",
      "panchayat.tenure": "कार्यकाल",
      "panchayat.message": "हमारे प्रिय गांव समुदाय की समृद्धि और विकास के लिए मिलकर काम कर रहे हैं।",
      "panchayat.officeHours": "कार्यालय समय",
      "panchayat.responsibilities": "पंचायत की जिम्मेदारियां",


      // Proud People
"proud-peopleWorkers.title": " गौरवशाली लोग",
"proud-peopleWorkers.description":
  "उन व्यक्तियों का सम्मान जो अपनी उपलब्धियों और योगदान से हमारे गांव का नाम रोशन कर रहे हैं",


  // आशा कार्यकर्ता

  "ashaWorkers.title": "आशा कार्यकर्ता",
  "ashaWorkers.description": "आशा (मान्यता प्राप्त सामाजिक स्वास्थ्य कार्यकर्ता) गांव स्तर पर प्राथमिक स्वास्थ्य सेवाएं प्रदान करती हैं, मातृ एवं शिशु स्वास्थ्य को बढ़ावा देती हैं और समुदाय के कल्याण में सहयोग करती हैं।",

  "anganwadiWorkers.title": "आंगनवाड़ी कार्यकर्ता",
  "anganwadiWorkers.description": "आंगनवाड़ी कार्यकर्ता बाल पोषण, प्रारंभिक शिक्षा, स्वास्थ्य जागरूकता तथा महिलाओं और बच्चों के कल्याण के लिए महत्वपूर्ण सेवाएं प्रदान करती हैं।",

  // विकास कार्य
"developmentWorks.title": "विकास कार्य",
"developmentWorks.description":
  "गांव की बुनियादी सुविधाओं को सशक्त करने और जीवन स्तर सुधारने वाले जारी एवं पूर्ण विकास कार्यों की प्रगति देखें।",

      // Services
      "services.title": "गांव की सेवाएं",
      "services.description": "स्थानीय व्यवसायों से लेकर स्वास्थ्य और शिक्षा तक, हमारे गाँव में उपलब्ध सभी आवश्यक सेवाओं को जानें।",
      "services.owner": "मालिक",
      "services.doctor": "डॉक्टर",
      "services.teacher": "शिक्षक",
      "services.pujari": "पुजारी",
      "services.category.retailsgrocery": "खुदरा और किराना",
      "services.category.transportation": "परिवहन",
      "services.category.religiousservices": "धार्मिक सेवाएं",
      "services.category.education": "शिक्षा",
      "services.category.fooddining": "भोजन और भोजनालय",
      "services.category.healthcare": "स्वास्थ्य सेवा",
      
      // Gallery
      "gallery.title": "गांव की गैलरी",
      "gallery.description": "हमारे गांव के जीवन, त्योहारों, विकास परियोजनाओं और सामुदायिक कार्यक्रमों के यादगार पलों का अन्वेषण करें जो हमारी समृद्ध विरासत और प्रगति को दर्शाते हैं।",
      "gallery.categories": "गैलरी श्रेणियां",
      "gallery.viewAll": "सभी देखें",
      "gallery.photo": "फोटो",
      "gallery.photos": "फोटो",
      "gallery.shareYourMoments": "अपने गांव के पल साझा करें",
      "gallery.uploadDescription": "गांव के कार्यक्रमों की फोटो या वीडियो हैं? उन्हें हमारे साथ साझा करें ताकि वे हमारी सामुदायिक गैलरी में प्रदर्शित हो सकें। हमारे गांव की यात्रा का दस्तावेजीकरण करने और हमारी उपलब्धियों को एक साथ मनाने में हमारी मदद करें।",
      "gallery.acceptedTypes": "फोटो और वीडियो स्वागत है",
      "gallery.moderation": "समुदाय द्वारा मॉडरेट",
      
      // Footer
      "footer.aboutDescription": "एक प्रगतिशील गांव जो सतत विकास, पारदर्शी शासन और सभी निवासियों के लिए समावेशी विकास के लिए प्रतिबद्ध है।",
      "footer.quickLinks": "त्वरित लिंक",
      "footer.aboutVillage": "गांव के बारे में",
      "footer.panchayatMembers": "पंचायत सदस्य",
      "footer.governmentSchemes": "सरकारी योजनाएं",
      "footer.developmentWorks": "विकास कार्य",
      "footer.services": "सेवाएं",
      "footer.birthCertificate": "जन्म प्रमाणपत्र",
      "footer.deathCertificate": "मृत्यु प्रमाणपत्र",
      "footer.propertyTax": "संपत्ति कर",
      "footer.rtiApplication": "आरटीआई आवेदन",
       "footer.gramSbhaResolution":"hello",
      "footer.contactInfo": "संपर्क जानकारी",
      "footer.followUs": "हमें फॉलो करें",
      "footer.copyright": "© {{year}} {{village}}। सर्वाधिकार सुरक्षित।",
      "footer.tagline": "पारदर्शी और कुशल ग्रामीण शासन के लिए विकसित",
      "footer.privacyPolicy": "गोपनीयता नीति",
      "footer.termsOfService": "सेवा की शर्तें",
      "footer.rtiGuidelines": "आरटीआई दिशानिर्देश",
      "footer.officialLinks": "आधिकारिक लिंक",
      
      // Schemes
    "schemes.title": "सरकारी योजनाएँ और सेवाएँ",
    "schemes.description": "ग्रामीण विकास के लिए बनाई गई विभिन्न सरकारी योजनाओं और सेवाओं का लाभ उठाएँ।",
      "schemes.benefits": "लाभ",
      "schemes.eligibility": "पात्रता",
      "schemes.process": "आवेदन प्रक्रिया",
      "schemes.applyNow": "अभी आवेदन करें",
      "schemes.learnMore": "और जानें",
      "schemes.needHelp": "आवेदन में सहायता चाहिए?",
      "schemes.helpDescription": "हमारा पंचायत कार्यालय योजना आवेदन, दस्तावेज़ सत्यापन और स्थिति ट्रैकिंग के लिए मुफ्त सहायता प्रदान करता है। कार्यालय समय के दौरान जाएं या अपॉइंटमेंट के लिए कॉल करें।",
      "schemes.phoneSupport": "फोन सहायता",
      "schemes.inPersonHelp": "व्यक्तिगत सहायता",
      "schemes.documentHelp": "दस्तावेज़ सहायता",
      "schemes.freeVerification": "मुफ्त सत्यापन",
      "schemes.downloadForms": "फॉर्म डाउनलोड करें",
      "schemes.contactOffice": "कार्यालय से संपर्क करें",
      
      // Development
      "development.title": "विकास कार्य",
      "development.description": "हमारे गांव में किए गए विभिन्न विकास परियोजनाओं की प्रगति ट्रैक करें।",
      "development.summary": "विकास सारांश",
      "development.completed": "पूर्ण परियोजनाएं",
      "development.ongoing": "चालू परियोजनाएं",
      "development.planned": "नियोजित परियोजनाएं",
      "development.totalInvestment": "कुल निवेश",
      "development.budget": "बजट",
      "development.timeline": "समयरेखा",
      "development.progress": "प्रगति",
      "development.startDate": "प्रारंभ तिथि",
      "development.completionDate": "पूर्ण",
      "development.expectedCompletion": "अपेक्षित समापन",
      "development.projectBudget": "परियोजना बजट",
      "development.status": "स्थिति",
      "development.statusCompleted": "परियोजना समय पर सफलतापूर्वक पूरी हुई",
      "development.statusOngoing": "कार्य प्रगति पर है - पंचायत कार्यालय में नियमित अपडेट उपलब्ध",
      "development.statusPlanned": "परियोजना स्वीकृत - कार्यान्वयन जल्द शुरू होगा",
      
      // Contact
      "contact.title": "हमसे संपर्क करें",
      "contact.description": "किसी भी प्रश्न, शिकायत या सरकारी सेवाओं और गांव विकास मामलों में सहायता के लिए अपने ग्राम पंचायत से संपर्क करें।",
      "contact.office": "पंचायत कार्यालय",
      "contact.emergency": "आपातकालीन संपर्क",
      "contact.getDirections": "दिशा निर्देश प्राप्त करें",
      "contact.sendMessage": "संदेश भेजें",
      "contact.name": "पूरा नाम",
      "contact.phone": "फोन नंबर",
      "contact.email": "ईमेल पता",
      "contact.subject": "विषय",
      "contact.message": "संदेश",
      "contact.submit": "संदेश भेजें",
      "contact.quickServices": "त्वरित सेवाएं",
      "contact.apply": "आवेदन करें",
      "contact.officeHours": "कार्यालय समय",
      "contact.phone2": "फोन",
      "contact.email2": "ईमेल",
      "contact.urgentNote": "तत्काल मामलों के लिए, कृपया सीधे हमारे कार्यालय को कॉल करें। हम 2-3 व्यावसायिक दिनों के भीतर सभी संदेशों का जवाब देने का लक्ष्य रखते हैं।",
      "contact.enterName": "अपना पूरा नाम दर्ज करें",
      "contact.enterPhone": "अपना फोन नंबर दर्ज करें",
      "contact.enterEmail": "अपना ईमेल पता दर्ज करें",
      "contact.enterSubject": "यह किस बारे में है?",
      "contact.enterMessage": "कृपया अपनी पूछताछ, शिकायत या सुझाव को विस्तार से बताएं...",
      "contact.police": "पुलिस",
      "contact.fire": "अग्निशमन",
      "contact.ambulance": "एम्बुलेंस",
      "contact.localEmergency": "स्थानीय आपातकाल",
      
      // notice board 
  "notices.title": "सूचना पटल",
  "notices.subtitle": "नवीनतम आधिकारिक सूचनाएँ और घोषणाएँ",
  "notices.metaDescription": "ग्राम पंचायत की नवीनतम आधिकारिक सूचनाएँ देखें।",

  "notices.search": "सूचनाएँ खोजें...",
  "notices.none": "कोई सूचना उपलब्ध नहीं है",
  "notices.checkBack": "कृपया बाद में दुबारा देखें",

  "notices.category": "श्रेणी",
  "notices.date": "तारीख",
  "notices.readMore": "और पढ़ें",
  "notices.attachment": "संलग्नक देखें",
  "notices.viewAttachment": "संलग्नक खोलें",

  "notices.active": "सक्रिय",
  "notices.inactive": "समाप्त सूचना",

  "notices.all": "सभी",
  "notices.general": "सामान्य",
  "notices.meeting": "बैठक",
  "notices.urgent": "जरूरी",
  "notices.tender": "निविदा",
  "notices.scheme": "योजना",
  "notices.election": "चुनाव",
      // Common
      "common.district": "जिला",
      "common.state": "राज्य",
      "common.high": "उच्च",
      "common.medium": "मध्यम",
      "common.low": "कम",
      "common.coordinates": "निर्देशांक",
      "common.altitude": "ऊंचाई",
      "common.area": "क्षेत्रफल",
      "common.totalPopulation": "कुल जनसंख्या",
      "common.malePopulation": "पुरुष जनसंख्या",
      "common.femalePopulation": "महिला जनसंख्या",
      "common.literacyRate": "साक्षरता दर",
      "common.genderRatio": "लिंग अनुपात",
      "common.femalesPerMales": "प्रति 1000 पुरुषों पर महिलाएं",
      "common.progressiveValues": "राष्ट्रीय औसत से ऊपर, प्रगतिशील सामाजिक मूल्यों को दर्शाता है",
      "common.administrativeDetails": "प्रशासनिक विवरण",
      "common.pinCode": "पिन कोड",
      "common.ward": "वार्ड",
      "common.department": "विभाग",
      "common.position": "पद",
      "common.responsibilities": "जिम्मेदारियां",

      // news ticker 
       "news.latest" : "ताजा खबर"
    }
  },
  mr: {
    translation: {
      // Header
      "header.title": "शिवनखेड (खु)",
      "header.about": "आमच्याबद्दल",
      "header.services": "सेवा",
      "header.panchayat": "पंचायत",
      "header.contact": "संपर्क",
      
      // Header – Auth / Navigation
"header.home": "मुख्यपृष्ठ",
"header.admin": "प्रशासक",
"header.myProfile": "माझी प्रोफाइल",
"header.login": "लॉगिन",
"header.adminDashboard": "प्रशासन डॅशबोर्ड",
"header.logout": "लॉगआउट",



  // Media Gallery
  "mediaGallery.title": "मीडिया गॅलरी",
  "mediaGallery.subtitle": "गावातील सण, विकास कामे आणि सामुदायिक कार्यक्रमांचे फोटो आणि व्हिडिओ पहा.",
  "mediaGallery.photosTab": "फोटो गॅलरी",
  "mediaGallery.videosTab": "व्हिडिओ गॅलरी",
  "mediaGallery.filterAll": "सर्व",
  "mediaGallery.noPhotosTitle": "फोटो उपलब्ध नाहीत",
  "mediaGallery.noPhotosText": "गॅलरी फोटो लवकरच अपडेट केले जातील.",
  "mediaGallery.noVideosTitle": "व्हिडिओ उपलब्ध नाहीत",
  "mediaGallery.noVideosText": "व्हिडिओ गॅलरी लवकरच अपडेट केली जाईल.",
  "mediaGallery.seoImageTitle": "फोटो गॅलरी",
  "mediaGallery.seoVideoTitle": "व्हिडिओ गॅलरी",
  "mediaGallery.seoDescription": "आपल्या गावाची मीडिया गॅलरी — फोटो आणि व्हिडिओ पहा",
      // Proud People
"proud-peopleWorkers.title": "गौरवशाली व्यक्ती",
"proud-peopleWorkers.description":
  "आपल्या कर्तृत्व व योगदानातून गावाचा मान वाढवणाऱ्या व्यक्तींचा गौरव",

// आशा सेविका

  "ashaWorkers.title": "आशा कार्यकर्त्या",
  "ashaWorkers.description": "आशा (Accredited Social Health Activist) कार्यकर्त्या गाव पातळीवर प्राथमिक आरोग्य सेवा पुरवणे, माता व बाल आरोग्याची काळजी घेणे आणि समुदायाच्या आरोग्य जनजागृतीसाठी कार्य करतात.",

  "anganwadiWorkers.title": "अंगणवाडी सेविका",
  "anganwadiWorkers.description": "अंगणवाडी सेविका बाल पोषण, पूर्व प्राथमिक शिक्षण, आरोग्य विषयक जनजागृती तसेच महिला व बालकांच्या कल्याणासाठी महत्त्वाची भूमिका बजावतात.",

// विकास कामे
"developmentWorks.title": "विकास कामे",
"developmentWorks.description":
  "गावातील पायाभूत सुविधा सुधारण्यासाठी व जीवनमान उंचावण्यासाठी सुरू असलेल्या व पूर्ण झालेल्या विकास कामांचा आढावा घ्या.",

      // Hero
      "hero.title": "शिवनखेड (खु) गावात आपले स्वागत आहे",
      "hero.subtitle": "लातूर जिल्हा, महाराष्ट्रातील एक प्रगतीशील गाव",
      "hero.description": "आमच्या जोमदार समुदाय, समृद्ध संस्कृती आणि विकास उपक्रमांचा शोध घ्या जे शिवनखेड खुर्दला ग्रामीण महाराष्ट्रातील एक आदर्श गाव बनवतात।",
      "hero.explore": "गाव पहा",
      "hero.contact": "पंचायत संपर्क",
      
      // About
      "about.title": "आमच्या गावाबद्दल",
      "about.description": "शिवनखेड (खु) गावाचा समृद्ध वारसा, जोमदार संस्कृती आणि प्रगतीशील विकास शोधा।",
      "about.location": "स्थान आणि भूगोल",
      "about.population": "लोकसंख्याशास्त्र",
      "about.culture": "संस्कृती आणि परंपरा",
      "about.established": "स्थापित",
      
      // Announcements
      "announcements.title": "नवीनतम घोषणा",
      "announcements.description": "आपल्या ग्राम पंचायतकडून महत्वाच्या सूचना, सभेचे वेळापत्रक आणि विकास अपडेटसह अपडेट राहा।",
      "announcements.published": "प्रकाशित",
      "announcements.addToCalendar": "कॅलेंडरमध्ये जोडा",
      "announcements.stayUpdated": "अपडेट राहा",
      "announcements.neverMiss": "आपल्या ग्राम पंचायतच्या महत्वाच्या घोषणा कधीही चुकवू नका। सभा, योजना आणि विकास अपडेटची सूचना मिळवा।",
      "announcements.whatsapp": "व्हाट्सऍप अपडेट",
      "announcements.joinGroup": "समुदायिक गटात सामील व्हा",
      "announcements.noticeBoard": "सूचना फलक",
      "announcements.visitOffice": "पंचायत कार्यालयात भेट द्या",
      "announcements.contactUpdates": "अपडेटसाठी संपर्क साधा",
      
          // Gov Staff Section
      "govstaff.title": "शासकीय कर्मचारी",
"govstaff.description": "आपल्या गावाच्या विकास आणि कल्याणासाठी कार्य करणारे शासकीय अधिकारी",

      // Panchayat
      "panchayat.title": "पंचायत प्रतिनिधी",
       "panchayat.description":"आपल्या गावाच्या विकास आणि कल्याणासाठी अहोरात्र कार्य करणाऱ्या आपल्या निवडून आलेल्या प्रतिनिधींना भेटा.",
      "panchayat.sarpanch": "सरपंच",
      "panchayat.wardMembers": "वॉर्ड सदस्य",
      "panchayat.secretary": "पंचायत सचिव",
      "panchayat.staff": "पंचायत कर्मचारी",
      "panchayat.tenure": "कार्यकाळ",
      "panchayat.message": "आमच्या प्रिय गाव समुदायाची समृद्धी आणि विकासासाठी एकत्र काम करत आहोत।",
      "panchayat.officeHours": "कार्यालयीन वेळ",
      "panchayat.responsibilities": "पंचायतच्या जबाबदाऱ्या",
      
      // Services
      "services.title": "गावातील सेवा",
      "services.description": "आपल्या गावातील स्थानिक व्यवसायांपासून आरोग्य व शिक्षणापर्यंत उपलब्ध असलेल्या सर्व महत्त्वाच्या सेवांची माहिती जाणून घ्या.",
      "services.owner": "मालक",
      "services.doctor": "डॉक्टर", 
      "services.teacher": "शिक्षक",
      "services.pujari": "पुजारी",
      "services.category.retailsgrocery": "किरकोळ आणि किराणा",
      "services.category.transportation": "वाहतूक",
      "services.category.religiousservices": "धार्मिक सेवा",
      "services.category.education": "शिक्षण",
      "services.category.fooddining": "अन्न आणि जेवणघर",
      "services.category.healthcare": "आरोग्य सेवा",
      
      // Gallery
      "gallery.title": "गावाची गॅलरी",
      "gallery.description": "आमच्या गावातील जीवन, सण, विकास प्रकल्प आणि समुदायिक कार्यक्रमांचे संस्मरणीय क्षण शोधा जे आमचा समृद्ध वारसा आणि प्रगती दर्शवतात।",
      "gallery.categories": "गॅलरी श्रेणी",
      "gallery.viewAll": "सर्व पहा",
      "gallery.photo": "फोटो",
      "gallery.photos": "फोटो",
      "gallery.shareYourMoments": "आपले गावातील क्षण शेअर करा",
      "gallery.uploadDescription": "गावातील कार्यक्रमांचे फोटो किंवा व्हिडिओ आहेत? आमच्या समुदायिक गॅलरीमध्ये प्रदर्शित करण्यासाठी ते आमच्याशी शेअर करा. आमच्या गावाच्या प्रवासाचे दस्तऐवजीकरण करण्यात आणि आमच्या यशांना एकत्रितपणे साजरे करण्यात आम्हाला मदत करा।",
      "gallery.acceptedTypes": "फोटो आणि व्हिडिओ स्वागत आहे",
      "gallery.moderation": "समुदायाद्वारे मॉडरेट",
      
      // Footer
      "footer.aboutDescription": "शाश्वत विकास, पारदर्शक शासन आणि सर्व रहिवाशांसाठी सर्वसमावेशक वाढीसाठी वचनबद्ध असलेले एक प्रगतीशील गाव।",
      "footer.quickLinks": "द्रुत दुवे",
      "footer.aboutVillage": "गावाबद्दल",
      "footer.panchayatMembers": "पंचायत सदस्य",
      "footer.governmentSchemes": "सरकारी योजना",
      "footer.developmentWorks": "विकास कामे",
      "footer.services": "सेवा",
      "footer.birthCertificate": "जन्म प्रमाणपत्र",
      "footer.deathCertificate": "मृत्यू प्रमाणपत्र",
      "footer.propertyTax": "मालमत्ता कर",
      "footer.rtiApplication": "आरटीआय अर्ज",
        "footer.gramSbhaResolution":"hello",
      "footer.contactInfo": "संपर्क माहिती",
      "footer.followUs": "आम्हाला फॉलो करा",
      "footer.copyright": "© {{year}} {{village}}. सर्व हक्क राखीव.",
      "footer.tagline": "पारदर्शक आणि कार्यक्षम ग्रामीण शासनासाठी विकसित",
      "footer.privacyPolicy": "गोपनीयता धोरण",
      "footer.termsOfService": "सेवा अटी",
      "footer.rtiGuidelines": "आरटीआय मार्गदर्शक तत्त्वे",
      "footer.officialLinks": "अधिकृत दुवे",
      
      // Schemes
    "schemes.title": "शासकीय योजना आणि सेवा",
"schemes.description": "ग्रामीण विकासासाठी तयार केलेल्या विविध शासकीय योजना आणि सेवांचा लाभ घ्या.",
      "schemes.benefits": "फायदे",
      "schemes.eligibility": "पात्रता",
      "schemes.process": "अर्ज प्रक्रिया",
      "schemes.applyNow": "आता अर्ज करा",
      "schemes.learnMore": "अधिक जाणा",
      "schemes.needHelp": "अर्जात मदत हवी आहे?",
      "schemes.helpDescription": "आमचे पंचायत कार्यालय योजना अर्ज, दस्तऐवज पडताळणी आणि स्थिती ट्रॅकिंगसाठी मोफत सहाय्य प्रदान करते। कार्यालय वेळेत भेट द्या किंवा भेटीसाठी कॉल करा।",
      "schemes.phoneSupport": "फोन सहाय्य",
      "schemes.inPersonHelp": "वैयक्तिक मदत",
      "schemes.documentHelp": "दस्तऐवज मदत",
      "schemes.freeVerification": "मोफत पडताळणी",
      "schemes.downloadForms": "फॉर्म डाउनलोड करा",
      "schemes.contactOffice": "कार्यालयाशी संपर्क साधा",
      //notice board 
      
  "notices.title": "सूचना फलक",
  "notices.subtitle": "नवीन अधिकृत सूचना आणि घोषणा",
  "notices.metaDescription": "ग्रामपंचायतीच्या ताज्या अधिकृत सूचना पहा.",

  "notices.search": "सूचना शोधा...",
  "notices.none": "कोणतीही सूचना उपलब्ध नाही",
  "notices.checkBack": "कृपया नंतर पुन्हा पहा",

  "notices.category": "विभाग",
  "notices.date": "तारीख",
  "notices.readMore": "अधिक वाचा",
  "notices.attachment": "संलग्नक पहा",
  "notices.viewAttachment": "संलग्नक उघडा",

  "notices.active": "सक्रिय",
  "notices.inactive": "कालबाह्य सूचना",

  "notices.all": "सर्व",
  "notices.general": "सामान्य",
  "notices.meeting": "बैठक",
  "notices.urgent": "त्वरित",
  "notices.tender": "टेंडर",
  "notices.scheme": "योजना",
  "notices.election": "निवडणूक",
      // Development
      "development.title": "विकास कामे",
      "development.description": "आमच्या गावात केलेल्या विविध विकास प्रकल्पांची प्रगती ट्रॅक करा।",
      "development.summary": "विकास सारांश",
      "development.completed": "पूर्ण प्रकल्प",
      "development.ongoing": "चालू प्रकल्प",
      "development.planned": "नियोजित प्रकल्प",
      "development.totalInvestment": "एकूण गुंतवणूक",
      "development.budget": "अंदाजपत्रक",
      "development.timeline": "कालमर्यादा",
      "development.progress": "प्रगती",
      "development.startDate": "सुरुवात तारीख",
      "development.completionDate": "पूर्ण",
      "development.expectedCompletion": "अपेक्षित पूर्णता",
      "development.projectBudget": "प्रकल्प अंदाजपत्रक",
      "development.status": "स्थिती",
      "development.statusCompleted": "प्रकल्प वेळेवर यशस्वीपणे पूर्ण झाला",
      "development.statusOngoing": "काम प्रगतीपथावर आहे - पंचायत कार्यालयात नियमित अपडेट उपलब्ध",
      "development.statusPlanned": "प्रकल्प मंजूर - अंमलबजावणी लवकरच सुरू होईल",
      
      // Contact
      "contact.title": "आमच्याशी संपर्क साधा",
      "contact.description": "कोणत्याही प्रश्न, तक्रार किंवा सरकारी सेवा आणि गाव विकास प्रकरणांसाठी सहाय्यासाठी आपल्या ग्राम पंचायतशी संपर्क साधा।",
      "contact.office": "पंचायत कार्यालय",
      "contact.emergency": "आपत्कालीन संपर्क",
      "contact.getDirections": "दिशानिर्देश मिळवा",
      "contact.sendMessage": "संदेश पाठवा",
      "contact.name": "पूर्ण नाव",
      "contact.phone": "फोन नंबर",
      "contact.email": "ईमेल पत्ता",
      "contact.subject": "विषय",
      "contact.message": "संदेश",
      "contact.submit": "संदेश पाठवा",
      "contact.quickServices": "तत्काळ सेवा",
      "contact.apply": "अर्ज करा",
      "contact.officeHours": "कार्यालय वेळ",
      "contact.phone2": "फोन",
      "contact.email2": "ईमेल",
      "contact.urgentNote": "तातडीच्या प्रकरणांसाठी, कृपया आमच्या कार्यालयाला थेट कॉल करा. आम्ही 2-3 कामकाजाच्या दिवसांत सर्व संदेशांना प्रतिसाद देण्याचे लक्ष्य ठेवतो।",
      "contact.enterName": "आपले पूर्ण नाव प्रविष्ट करा",
      "contact.enterPhone": "आपला फोन नंबर प्रविष्ट करा",
      "contact.enterEmail": "आपला ईमेल पत्ता प्रविष्ट करा",
      "contact.enterSubject": "हे कशाबद्दल आहे?",
      "contact.enterMessage": "कृपया आपली चौकशी, तक्रार किंवा सूचना तपशीलवार वर्णन करा...",
      "contact.police": "पोलीस",
      "contact.fire": "अग्निशामक",
      "contact.ambulance": "रुग्णवाहिका",
      "contact.localEmergency": "स्थानिक आपत्काल",
      
      // Common
      "common.district": "जिल्हा",
      "common.state": "राज्य",
      "common.high": "उच्च",
      "common.medium": "मध्यम",
      "common.low": "कमी",
      "common.coordinates": "निर्देशांक",
      "common.altitude": "उंची",
      "common.area": "क्षेत्रफळ",
      "common.totalPopulation": "एकूण लोकसंख्या",
      "common.malePopulation": "पुरुष लोकसंख्या",
      "common.femalePopulation": "महिला लोकसंख्या",
      "common.literacyRate": "साक्षरता दर",
      "common.genderRatio": "लिंग गुणोत्तर",
      "common.femalesPerMales": "प्रति 1000 पुरुषांवर महिला",
      "common.progressiveValues": "राष्ट्रीय सरासरीपेक्षा जास्त, प्रगतीशील सामाजिक मूल्ये प्रतिबिंबित करते",
      "common.administrativeDetails": "प्रशासकीय तपशील",
      "common.pinCode": "पिन कोड",
      "common.ward": "प्रभाग",
      "common.department": "विभाग",
      "common.position": "पद",
      "common.responsibilities": "जबाबदाऱ्या",

      // news ticker
      "news.latest" : "ताज्या बातम्या"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'mr',
    fallbackLng: 'mr',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
