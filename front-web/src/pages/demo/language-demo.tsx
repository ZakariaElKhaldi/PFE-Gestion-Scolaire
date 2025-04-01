import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../../components/ui/language-selector';
import { useLanguage } from '../../lib/language-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { AlertCircle, Info, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';

export default function LanguageDemo() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  // The Arrow component will change direction based on text direction
  const DirectionalArrow = () => {
    return isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('language.multiLanguageDemo')}</h1>
        <LanguageSelector />
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>{t('language.currentDirection')}: {isRTL ? 'RTL' : 'LTR'}</AlertTitle>
        <AlertDescription>
          {t('language.directionExplanation')}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('language.textDirection')}</CardTitle>
            <CardDescription>{t('language.textDirectionDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span>{t('common.english')}:</span>
                <span>This text is in English (LTR)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{t('common.french')}:</span>
                <span>Ce texte est en français (LTR)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{t('common.arabic')}:</span>
                <span>هذا النص باللغة العربية (RTL)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('language.userInterface')}</CardTitle>
            <CardDescription>{t('language.uiDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('language.buttonAlignment')}</Label>
                <div className="space-x-2">
                  <Button variant="outline">{t('common.cancel')}</Button>
                  <Button>{t('common.save')}</Button>
                </div>
              </div>
              <div>
                <Label>{t('language.inputFields')}</Label>
                <Input placeholder={t('language.inputPlaceholder')} className="mt-1" />
              </div>
              <div>
                <Label>{t('language.iconDirection')}</Label>
                <Button className="w-full mt-1">
                  {t('language.continue')} <DirectionalArrow />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('language.forms')}</CardTitle>
          <CardDescription>{t('language.formsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t('language.firstName')}</Label>
                <Input id="firstName" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="lastName">{t('language.lastName')}</Label>
                <Input id="lastName" className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">{t('language.email')}</Label>
              <Input id="email" type="email" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="message">{t('language.message')}</Label>
              <Textarea id="message" className="mt-1" rows={4} />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">{t('common.reset')}</Button>
          <Button>{t('common.submit')}</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('language.components')}</CardTitle>
          <CardDescription>{t('language.componentsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="tab1">{t('language.tab')} 1</TabsTrigger>
              <TabsTrigger value="tab2">{t('language.tab')} 2</TabsTrigger>
              <TabsTrigger value="tab3">{t('language.tab')} 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <Alert variant="default">
                <Check className="h-4 w-4" />
                <AlertTitle>{t('language.successHeader')}</AlertTitle>
                <AlertDescription>
                  {t('language.successMessage')}
                </AlertDescription>
              </Alert>
            </TabsContent>
            <TabsContent value="tab2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('language.errorHeader')}</AlertTitle>
                <AlertDescription>
                  {t('language.errorMessage')}
                </AlertDescription>
              </Alert>
            </TabsContent>
            <TabsContent value="tab3">
              <div className="text-center p-4">
                <p>{t('language.tabContent')}</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 