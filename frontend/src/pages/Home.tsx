import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, TrendingUp, Shield, Heart, ChevronRight, Star } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import heroImage from '@/assets/hero-illustration.png';
import featureCalendar from '@/assets/feature-calendar.png';
import featureAnalytics from '@/assets/feature-analytics.png';
import featurePrivacy from '@/assets/feature-privacy.png';
import featureInsights from '@/assets/feature-insights.png';

const features = [
  { icon: Calendar, title: 'Cycle Tracking', description: 'Log your periods and symptoms with an intuitive calendar interface.', image: featureCalendar },
  { icon: TrendingUp, title: 'Smart Predictions', description: 'AI-powered predictions that learn from your unique cycle patterns.', image: featureAnalytics },
  { icon: Heart, title: 'Health Insights', description: 'Understand your body better with detailed analytics and trends.', image: featureInsights },
  { icon: Shield, title: 'Private & Secure', description: 'Your data stays yours. End-to-end encryption keeps it safe.', image: featurePrivacy },
];

const testimonials = [
  { name: 'Sarah M.', text: 'Finally an app that accurately predicts my cycle. The insights have been incredibly helpful!', rating: 5 },
  { name: 'Jessica L.', text: 'Clean, simple, and effective. I love how easy it is to log my symptoms.', rating: 5 },
  { name: 'Emily R.', text: 'The analytics helped me understand patterns I never noticed before.', rating: 5 },
];

export const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Track your cycle with <span className="text-primary">confidence</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                Simple, accurate period tracking with smart predictions. Understand your body, plan ahead, and take control of your health.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 px-8">Get Started Free <ChevronRight className="ml-2 w-5 h-5" /></Button>
                </Link>
                <Link to="/login"><Button size="lg" variant="outline" className="px-8">Sign In</Button></Link>
              </div>
            </div>
            <div className="hidden lg:block"><img src={heroImage} alt="Synkria App" className="w-full max-w-md mx-auto" /></div>
          </div>
        </div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </section>

      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything you need to track your health</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Powerful features designed to give you insights and peace of mind.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 border border-border hover:border-primary/30 transition-colors group">
                <img src={feature.image} alt={feature.title} className="w-16 h-16 object-contain mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[{ value: '500K+', label: 'Active Users' }, { value: '95%', label: 'Prediction Accuracy' }, { value: '10M+', label: 'Cycles Tracked' }, { value: '4.9', label: 'App Rating' }].map((stat, index) => (
              <div key={index}><div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div><div className="text-muted-foreground text-sm">{stat.label}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Loved by thousands</h2>
            <p className="text-muted-foreground text-lg">See what our users have to say about their experience.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 border border-border">
                <div className="flex gap-1 mb-4">{[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}</div>
                <p className="text-foreground mb-4">"{testimonial.text}"</p>
                <p className="text-sm text-muted-foreground font-medium">— {testimonial.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Ready to take control?</h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-xl mx-auto">Join thousands of users who trust Synkria for their cycle tracking needs.</p>
          <Link to="/signup"><Button size="lg" variant="secondary" className="px-8">Start Tracking Today <ChevronRight className="ml-2 w-5 h-5" /></Button></Link>
        </div>
      </section>

      <footer className="py-12 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center"><span className="text-primary-foreground font-bold">S</span></div>
              <span className="font-semibold text-foreground">Synkria</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Help</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Synkria. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
