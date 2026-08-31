import { useState } from 'react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import heroImg from '@assets/bal-vikas-public-school_1784611430239.jpg';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setIsSubmitted(true);
    form.reset();
  }

  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <div className="bg-primary pt-24 pb-16 px-4 relative overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/55" />
        <div className="container mx-auto text-center relative z-10">
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">Contact Us</h1>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full"></div>
            <p className="mt-6 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              We're here to help. Reach out to us for admissions, queries, or just to say hello.
            </p>
          </ScrollReveal>
        </div>
      </div>

      <section className="py-20 bg-background relative z-10">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* Contact Info */}
            <ScrollReveal direction="right">
              <div>
                <h2 className="text-3xl font-serif font-bold text-black mb-8">Get in Touch</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground mb-1">Our Address</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Railway Road, Kalayat,<br />
                        District Kaithal, Haryana – 136117
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground mb-1">Phone</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        +91 98125 50200
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground mb-1">School Hours</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Monday to Saturday: 8:00 AM – 3:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="mt-12 rounded-2xl overflow-hidden border border-border shadow-md h-80 bg-muted">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3449.234!2d76.2354!3d29.6807!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDQwJzUwLjUiTiA3NsKwMTQnMDcuNCJF!5e0!3m2!1sen!2sin!4v1714578119022!5m2!1sen!2sin"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Bal Vikas Public School Kalayat — Location"
                  ></iframe>
                </div>
                <a
                  href="https://maps.google.com/?q=Bal+Vikas+Public+School,Railway+Road,Kalayat,Haryana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm text-primary font-semibold hover:text-secondary transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Open in Google Maps
                </a>
              </div>
            </ScrollReveal>

            {/* Form */}
            <ScrollReveal direction="left" delay={0.2}>
              <div className="bg-white rounded-3xl p-8 md:p-10 border border-border shadow-xl">
                <h3 className="text-2xl font-serif font-bold text-black mb-6">Send an Enquiry</h3>
                
                {isSubmitted ? (
                  <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-8 text-center h-full flex flex-col justify-center items-center py-20">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                      <Send className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Thank You!</h4>
                    <p className="text-green-700/80">
                      Your enquiry has been received. Our administration office will contact you shortly.
                    </p>
                    <Button 
                      className="mt-8 bg-green-600 hover:bg-green-700 text-white rounded-full px-6"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your name" className="bg-background rounded-lg border-border" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your mobile number" type="tel" className="bg-background rounded-lg border-border" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="How can we help you?" 
                                className="bg-background rounded-lg border-border min-h-[150px] resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-6 text-lg font-bold">
                        Submit Enquiry
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>
    </div>
  );
}
