import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Phone, Mail, MapPin, Clock, User, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import MemberPopupModal from './MemberPopupModal';

interface PanchayatProps {
  panchayat: any;
}

const Panchayat = ({ panchayat }: PanchayatProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMemberClick = (member: any) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };
  useEffect(() => {
  if (location.hash) {
    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
}, [location]);


  return (
    <section id="panchayat" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold mb-4 text-gradient">
            {t('panchayat.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('panchayat.description')}
          </p>
        </div>

        {/* Sarpanch Section */}
          {/* <Card className="card-elegant max-w-4xl mx-auto animate-slide-up">
            <CardHeader className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary">
                <img 
                  src={panchayat.sarpanch.image} 
                  alt={panchayat.sarpanch.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardTitle className="text-3xl text-gradient mb-2">
                {panchayat.sarpanch.name}
              </CardTitle>
              <div>
                <Badge variant="secondary" className="text-lg px-3">
                {t('panchayat.sarpanch')}
              </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg text-muted-foreground mb-4">
                  {panchayat.sarpanch.education}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{t('panchayat.tenure')}: {panchayat.sarpanch.tenure}</span>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-6 border-l-4 border-primary">
                <blockquote className="text-lg italic text-center text-foreground mb-4">
                  "{t('panchayat.message')}"
                </blockquote>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {panchayat.sarpanch.contact}
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {panchayat.sarpanch.email}
                </Button>
              </div>
            </CardContent>
          </Card> */}

        
        {/* Sarpanch, Upsarpanch, and Secretary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Sarpanch Card */}
          <Card className="card-elegant hover-lift animate-slide-up">
            <CardHeader className="text-center">
              <div 
                className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg cursor-pointer hover:border-primary transition-all duration-300"
                onClick={() => handleMemberClick(panchayat.sarpanch)}
              >
                <img 
                  src={panchayat.sarpanch.image} 
                  alt={panchayat.sarpanch.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <CardTitle className="text-2xl text-gradient">{panchayat.sarpanch.name}</CardTitle>
              <Badge variant="secondary" className="mx-auto mt-2">
               {panchayat.sarpanch.position}
              </Badge>

            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {panchayat.sarpanch.description}
                </p>
               <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{t('panchayat.tenure')}: {panchayat.sarpanch.tenure}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={`tel:${panchayat.sarpanch.contact}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    {panchayat.sarpanch.contact}
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={`mailto:${panchayat.sarpanch.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    {panchayat.sarpanch.email}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upsarpanch Card */}
          {panchayat.upsarpanch && (
            <Card className="card-elegant hover-lift animate-slide-up">
              <CardHeader className="text-center">
                <div 
                  className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg cursor-pointer hover:border-primary transition-all duration-300"
                  onClick={() => handleMemberClick(panchayat.upsarpanch)}
                >
                  <img 
                    src={panchayat.upsarpanch.image} 
                    alt={panchayat.upsarpanch.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardTitle className="text-2xl text-gradient">{panchayat.upsarpanch.name}</CardTitle>
                <Badge variant="secondary" className="mx-auto mt-2">
              {panchayat.upsarpanch.position}
                </Badge>
                  
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {panchayat.upsarpanch.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{t('panchayat.tenure')}: {panchayat.upsarpanch.tenure}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={`tel:${panchayat.upsarpanch.contact}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      {panchayat.upsarpanch.contact}
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={`mailto:${panchayat.upsarpanch.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      {panchayat.upsarpanch.email}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Secretary Card */}
          <Card className="card-elegant hover-lift animate-slide-up">
            <CardHeader className="text-center">
              <div 
                className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg cursor-pointer hover:border-primary transition-all duration-300"
                onClick={() => handleMemberClick(panchayat.secretary)}
              >
                <img 
                  src={panchayat.secretary.image} 
                  alt={panchayat.secretary.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <CardTitle className="text-2xl text-gradient">{panchayat.secretary.name}</CardTitle>
              <Badge variant="secondary" className="mx-auto mt-2">
              {panchayat.secretary.position}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {panchayat.secretary.description || panchayat.secretary.department}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{t('panchayat.officeHours')}: {panchayat.secretary.office_hours}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={`tel:${panchayat.secretary.contact}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    {panchayat.secretary.contact}
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={`mailto:${panchayat.secretary.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    {panchayat.secretary.email}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ward Members Section */}
       <div id="ward" className="mb-16 scroll-mt-24">

  <h3 className="text-4xl font-bold text-center mb-8 text-gradient">
    {t('panchayat.wardMembers')}
  </h3>
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {panchayat.wardMembers.map((member, index) => (
      <Card 
        key={member.name} 
        className="card-elegant hover-lift animate-fade-in"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <CardHeader className="text-center">
          <div 
            className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 border-accent cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleMemberClick(member)}
          >
            <img 
              src={member.image} 
              alt={member.name}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
          <CardTitle className="text-xl">{member.name}</CardTitle>
          <Badge variant="outline" className="mx-auto">
            {member.position}
          </Badge>

          {/* ✅ New CardTitle for caste */}
          {member.caste && (
            <CardTitle className="text-base text-muted-foreground mt-1">
              {member.caste}
            </CardTitle>
          )}
        </CardHeader>

        <CardContent className="text-center space-y-3">
        {/* <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <h1 className="h-4 w-4" />
            <span>{member.ward}</span>
          </div> */} 
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `tel:${member.contact}`;
            }}
          >
            <Phone className="h-4 w-4 mr-2" />
            {member.contact}
          </Button>
        </CardContent>
      </Card>
    ))}
  </div>
</div>

        


        {/* Staff Section */}
     <div id="staff" className="mb-16 scroll-mt-24">
          <h3 className="text-4xl font-bold text-center mb-8 text-gradient">
            {t('panchayat.staff')}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {panchayat.staff.map((staff, index) => (
              <Card 
                key={staff.name} 
                className="card-elegant hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="text-center">
                  <div 
                    className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 border-muted cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleMemberClick(staff)}
                  >
                    <img 
                      src={staff.image} 
                      alt={staff.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardTitle className="text-lg">{staff.name}</CardTitle>
                  <Badge variant="outline" className="mx-auto text-xs">
                    {staff.position}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{staff.department}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `tel:${staff.contact}`;
                    }}
                  >
                    <Phone className="h-3 w-3 mr-2" />
                    {staff.contact}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Responsibilities Section */}
        {/* <div className="mt-16">
          <Card className="card-elegant animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Users className="h-6 w-6 text-primary" />
                Panchayat Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  "Water Supply & Sanitation",
                  "Road Construction & Maintenance",
                  "Primary Education",
                  "Healthcare Services",
                  "Rural Development Programs",
                  "Environmental Protection",
                  "Social Welfare Schemes",
                  "Agricultural Support",
                  "Women & Child Development",
                ].map((responsibility, index) => (
                  <div 
                    key={responsibility}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover-lift"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-sm font-medium">{responsibility}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>

      <MemberPopupModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
      />
    </section>
  );
};

export default Panchayat;