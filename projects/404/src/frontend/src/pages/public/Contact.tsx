import { Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export function Contact() {
  return (
    <div className="flex-1 w-full bg-background py-20">
      <div className="container px-4 mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold text-center mb-4">Contact Us</h1>
        <p className="text-center text-muted-foreground text-lg mb-12">Reach out to our support team for integrations, technical help, or sales inquiries.</p>
        
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full"><MapPin className="h-6 w-6 text-primary" /></div>
              <div>
                <h3 className="font-semibold text-lg">Headquarters</h3>
                <p className="text-muted-foreground">120 Medical Innovation Drive<br/>Suite 400<br/>San Francisco, CA 94107</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full"><Phone className="h-6 w-6 text-primary" /></div>
              <div>
                <h3 className="font-semibold text-lg">Phone Support</h3>
                <p className="text-muted-foreground">+1 (800) 555-CORE<br/>Mon-Fri 9am to 6pm EST</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full"><Mail className="h-6 w-6 text-primary" /></div>
              <div>
                <h3 className="font-semibold text-lg">Email Connections</h3>
                <p className="text-muted-foreground">support@healthcore.com<br/>enterprise@healthcore.com</p>
              </div>
            </div>
          </div>
          
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Let us know who you are" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="you@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="How can we help?" 
                  />
                </div>
                <Button className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
