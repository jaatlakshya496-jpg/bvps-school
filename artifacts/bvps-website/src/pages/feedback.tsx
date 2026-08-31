import { useState } from 'react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Button } from '@/components/ui/button';
import heroImg from '@assets/generated_images/about-classroom.jpg';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star, CheckCircle2 } from 'lucide-react';
import { saveFeedback } from '@/lib/feedback-store';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['parent', 'student', 'alumni', 'visitor'], {
    required_error: 'Please select your role',
  }),
  rating: z.number().min(1, 'Please select a rating').max(5),
  category: z.enum(['academics', 'facilities', 'staff', 'overall', 'other'], {
    required_error: 'Please select a category',
  }),
  feedback: z.string().min(10, 'Feedback must be at least 10 characters'),
});

type FormValues = z.infer<typeof formSchema>;

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hovered || value)
                ? 'fill-secondary text-secondary'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function Feedback() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      rating: 0,
      feedback: '',
    },
  });

  const rating = form.watch('rating');

  function onSubmit(values: FormValues) {
    saveFeedback(values);
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
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              Share Your Feedback
            </h1>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full"></div>
            <p className="mt-6 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Your thoughts help us grow. We value feedback from parents, students, and visitors.
            </p>
          </ScrollReveal>
        </div>
      </div>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <ScrollReveal>
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-border shadow-xl">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-black mb-3">
                    Thank You!
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Your feedback has been received. We appreciate you taking the time to share your experience with us.
                  </p>
                  <Button
                    className="mt-8 bg-primary hover:bg-primary/90 text-white rounded-full px-8"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Submit Another Feedback
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-serif font-bold text-black mb-8">
                    Feedback Form
                  </h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" className="rounded-lg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Role */}
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>You are a</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-lg">
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="parent">Parent / Guardian</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="alumni">Alumni</SelectItem>
                                <SelectItem value="visitor">Visitor</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category */}
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Feedback Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-lg">
                                  <SelectValue placeholder="What is your feedback about?" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="academics">Academics & Teaching</SelectItem>
                                <SelectItem value="facilities">Facilities & Infrastructure</SelectItem>
                                <SelectItem value="staff">Staff & Administration</SelectItem>
                                <SelectItem value="overall">Overall Experience</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Star Rating */}
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Rating</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-4">
                                <StarRating
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                                {rating > 0 && (
                                  <span className="text-sm font-medium text-secondary">
                                    {ratingLabels[rating]}
                                  </span>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Feedback Message */}
                      <FormField
                        control={form.control}
                        name="feedback"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Feedback</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Share your experience, suggestions, or comments..."
                                className="rounded-lg min-h-[150px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-secondary text-primary hover:bg-secondary/90 rounded-lg py-6 text-lg font-bold"
                      >
                        Submit Feedback
                      </Button>
                    </form>
                  </Form>
                </>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
