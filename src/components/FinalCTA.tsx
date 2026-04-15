import { Button } from '@/components/ui/button';


const PRODUCT_APP_URL = 'http://localhost:3000';

export function FinalCTA() {
        </
        <h2 className="text-4xl md:text-5xl font-bold mb
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            si
        
            Start Free Trial
          <Button 
            v
        
            Schedule a demo
        </div>
    </sectio
}


            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => window.location.href = `${PRODUCT_APP_URL}/signup`}
          >
            Start Free Trial
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-6"
            onClick={() => window.location.href = `${PRODUCT_APP_URL}/demo`}
          >
            Schedule a demo
          </Button>
        </div>
      </div>
    </section>
  );
}
