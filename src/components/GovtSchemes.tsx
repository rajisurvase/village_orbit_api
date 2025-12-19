import { useState } from "react";
import { ExternalLink, FileText, Building2, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import govtSchemesConfig from "@/data/govt-schemes-config.json";

type Lang = "en" | "hi" | "mr";

interface MultiLangText {
  en: string;
  hi: string;
  mr: string;
}

interface GovtScheme {
  id: string;
  name: MultiLangText;
  department: MultiLangText;
  briefInfo: MultiLangText;
  link: string;
  isActive: boolean;
}

interface BeneficiaryScheme {
  id: string;
  name: MultiLangText;
  eligibility: MultiLangText;
  applyLink: string;
  officialWebsite: string;
  isActive: boolean;
}

const GovtSchemes = () => {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("govt-schemes");
  
  const currentLang = (i18n.language?.split("-")[0] || "en") as Lang;

  const getText = (text: MultiLangText): string => {
    return text[currentLang] || text.en;
  };

  const { governmentSchemes, beneficiarySchemes } = govtSchemesConfig;
  const activeGovtSchemes = (governmentSchemes.schemes as GovtScheme[]).filter(s => s.isActive);
  const activeBeneficiarySchemes = (beneficiarySchemes.schemes as BeneficiaryScheme[]).filter(s => s.isActive);

  return (
    <section className="py-12 md:py-20 bg-gradient-subtle min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            <h1 className="text-2xl md:text-4xl font-bold text-gradient">
              {activeTab === "govt-schemes" 
                ? getText(governmentSchemes.title as MultiLangText)
                : getText(beneficiarySchemes.title as MultiLangText)
              }
            </h1>
          </div>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            {activeTab === "govt-schemes"
              ? getText(governmentSchemes.description as MultiLangText)
              : getText(beneficiarySchemes.description as MultiLangText)
            }
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 mb-8 h-auto">
            <TabsTrigger 
              value="govt-schemes" 
              className="text-xs sm:text-sm md:text-base py-2 md:py-3 px-2 md:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="h-4 w-4 mr-1 md:mr-2 flex-shrink-0" />
              <span className="truncate">{getText(governmentSchemes.title as MultiLangText)}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="beneficiary-schemes"
              className="text-xs sm:text-sm md:text-base py-2 md:py-3 px-2 md:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Info className="h-4 w-4 mr-1 md:mr-2 flex-shrink-0" />
              <span className="truncate">{getText(beneficiarySchemes.title as MultiLangText)}</span>
            </TabsTrigger>
          </TabsList>

          {/* Government Schemes Tab */}
          <TabsContent value="govt-schemes" className="animate-fade-in">
            <Card className="card-elegant">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {getText(governmentSchemes.title as MultiLangText)}
                </CardTitle>
                <CardDescription>
                  {getText(governmentSchemes.description as MultiLangText)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse" role="table" aria-label={getText(governmentSchemes.title as MultiLangText)}>
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left p-4 font-semibold text-sm" scope="col">
                          {getText(governmentSchemes.columns.schemeName as MultiLangText)}
                        </th>
                        <th className="text-left p-4 font-semibold text-sm" scope="col">
                          {getText(governmentSchemes.columns.department as MultiLangText)}
                        </th>
                        <th className="text-left p-4 font-semibold text-sm" scope="col">
                          {getText(governmentSchemes.columns.briefInfo as MultiLangText)}
                        </th>
                        <th className="text-center p-4 font-semibold text-sm" scope="col">
                          {getText(governmentSchemes.columns.moreInfo as MultiLangText)}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeGovtSchemes.map((scheme, index) => (
                        <tr 
                          key={scheme.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="p-4">
                            <span className="font-medium text-foreground">
                              {getText(scheme.name)}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary" className="text-xs">
                              {getText(scheme.department)}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground max-w-md">
                            {getText(scheme.briefInfo)}
                          </td>
                          <td className="p-4 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <a
                                href={scheme.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${getText(governmentSchemes.columns.moreInfo as MultiLangText)} - ${getText(scheme.name)}`}
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span className="hidden lg:inline">
                                  {getText(governmentSchemes.columns.moreInfo as MultiLangText)}
                                </span>
                              </a>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {activeGovtSchemes.map((scheme, index) => (
                    <Card 
                      key={scheme.id}
                      className="hover:shadow-md transition-shadow animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-foreground text-sm leading-tight">
                              {getText(scheme.name)}
                            </h3>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {getText(scheme.department)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {getText(scheme.briefInfo)}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 hover:bg-primary hover:text-primary-foreground"
                            asChild
                          >
                            <a
                              href={scheme.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${getText(governmentSchemes.columns.moreInfo as MultiLangText)} - ${getText(scheme.name)}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                              {getText(governmentSchemes.columns.moreInfo as MultiLangText)}
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Beneficiary Schemes Tab */}
          <TabsContent value="beneficiary-schemes" className="animate-fade-in">
            <Card className="card-elegant">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  {getText(beneficiarySchemes.title as MultiLangText)}
                </CardTitle>
                <CardDescription>
                  {getText(beneficiarySchemes.description as MultiLangText)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse" role="table" aria-label={getText(beneficiarySchemes.title as MultiLangText)}>
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left p-4 font-semibold text-sm" scope="col">
                          {getText(beneficiarySchemes.columns.schemeName as MultiLangText)}
                        </th>
                        <th className="text-left p-4 font-semibold text-sm" scope="col">
                          {getText(beneficiarySchemes.columns.eligibility as MultiLangText)}
                        </th>
                        <th className="text-center p-4 font-semibold text-sm" scope="col">
                          {getText(beneficiarySchemes.columns.applyLink as MultiLangText)}
                        </th>
                        <th className="text-center p-4 font-semibold text-sm" scope="col">
                          {getText(beneficiarySchemes.columns.officialWebsite as MultiLangText)}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeBeneficiarySchemes.map((scheme, index) => (
                        <tr 
                          key={scheme.id}
                          className="border-b border-border hover:bg-muted/30 transition-colors duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="p-4">
                            <span className="font-medium text-foreground">
                              {getText(scheme.name)}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground max-w-sm">
                            {getText(scheme.eligibility)}
                          </td>
                          <td className="p-4 text-center">
                            <Button
                              variant="default"
                              size="sm"
                              asChild
                              className="gap-2"
                            >
                              <a
                                href={scheme.applyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${getText(beneficiarySchemes.columns.applyLink as MultiLangText)} - ${getText(scheme.name)}`}
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span className="hidden lg:inline">
                                  {getText(beneficiarySchemes.columns.applyLink as MultiLangText)}
                                </span>
                              </a>
                            </Button>
                          </td>
                          <td className="p-4 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="gap-2 hover:bg-primary hover:text-primary-foreground"
                            >
                              <a
                                href={scheme.officialWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${getText(beneficiarySchemes.columns.officialWebsite as MultiLangText)} - ${getText(scheme.name)}`}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {activeBeneficiarySchemes.map((scheme, index) => (
                    <Card 
                      key={scheme.id}
                      className="hover:shadow-md transition-shadow animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-foreground text-sm">
                            {getText(scheme.name)}
                          </h3>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {getText(beneficiarySchemes.columns.eligibility as MultiLangText)}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {getText(scheme.eligibility)}
                            </p>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1 gap-2"
                              asChild
                            >
                              <a
                                href={scheme.applyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${getText(beneficiarySchemes.columns.applyLink as MultiLangText)} - ${getText(scheme.name)}`}
                              >
                                <ExternalLink className="h-4 w-4" />
                                {getText(beneficiarySchemes.columns.applyLink as MultiLangText)}
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="gap-2 hover:bg-primary hover:text-primary-foreground"
                            >
                              <a
                                href={scheme.officialWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${getText(beneficiarySchemes.columns.officialWebsite as MultiLangText)} - ${getText(scheme.name)}`}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default GovtSchemes;
