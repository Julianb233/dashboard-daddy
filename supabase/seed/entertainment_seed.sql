-- Entertainment Industry Seed Data (100+ entries)
-- Run after migrations: psql -f entertainment_seed.sql

-- ==========================================
-- ENTERTAINMENT CONTACTS (50 entries)
-- ==========================================

INSERT INTO entertainment_contacts (name, company, title, category, tier, email, linkedin, recent_projects, brands_represented, budget_range, status, priority, potential_value, tags) VALUES
-- Tier 1 Casting Directors
('Jennifer Vendetti', 'JV Casting', 'Founder', 'casting_director', 1, 'jennifer@jvcasting.com', 'linkedin.com/in/jennifervendetti', ARRAY['Nike "Just Do It" 2024', 'Apple iPhone 16', 'Mercedes-Benz S-Class'], ARRAY['Nike', 'Apple', 'Mercedes-Benz'], '$50K-500K', 'research', 'high', 50000, ARRAY['luxury', 'automotive', 'tech']),
('Michael Chen', 'Chen & Associates', 'Lead Casting Director', 'casting_director', 1, 'mchen@chenassociates.com', 'linkedin.com/in/michaelchencast', ARRAY['Gucci Ancora', 'Rolex Submariner', 'Louis Vuitton SS24'], ARRAY['Gucci', 'Rolex', 'Louis Vuitton'], '$100K+', 'contacted', 'urgent', 100000, ARRAY['luxury', 'fashion', 'watches']),
('Sarah Williams', 'Atomic Casting', 'Executive Director', 'casting_director', 1, 'sarah@atomiccasting.com', 'linkedin.com/in/sarahwilliamscasting', ARRAY['BMW M Series', 'Omega Seamaster', 'Tom Ford Noir'], ARRAY['BMW', 'Omega', 'Tom Ford'], '$75K-250K', 'meeting', 'high', 75000, ARRAY['automotive', 'fragrance', 'luxury']),
('David Park', 'Park Casting NYC', 'Founder & CEO', 'casting_director', 1, 'david@parkcastingnyc.com', 'linkedin.com/in/davidparkcast', ARRAY['Porsche Taycan', 'Ralph Lauren Purple Label', 'Cartier Love'], ARRAY['Porsche', 'Ralph Lauren', 'Cartier'], '$80K-400K', 'research', 'high', 80000, ARRAY['automotive', 'fashion', 'jewelry']),
('Amanda Torres', 'Torres Talent', 'Creative Casting Director', 'casting_director', 1, 'amanda@torrestalent.com', 'linkedin.com/in/amandatorrescasting', ARRAY['Lexus IS', 'Versace Eros', 'Dior Homme'], ARRAY['Lexus', 'Versace', 'Dior'], '$50K-200K', 'research', 'medium', 60000, ARRAY['automotive', 'fashion', 'fragrance']),

-- Tier 1 Talent Agents
('Marcus Johnson', 'CAA (Creative Artists Agency)', 'Commercial Agent', 'talent_agent', 1, 'mjohnson@caa.com', 'linkedin.com/in/marcusjohnsoncaa', ARRAY['Super Bowl 2024 Ads', 'Olympic Campaign Nike'], ARRAY['Nike', 'Gatorade', 'Samsung'], '$100K+', 'research', 'urgent', 150000, ARRAY['sports', 'commercial', 'celebrity']),
('Rebecca Liu', 'WME (William Morris)', 'Head of Commercial Division', 'talent_agent', 1, 'rliu@wmeagency.com', 'linkedin.com/in/rebeccaliuwme', ARRAY['Calvin Klein Eternity', 'Armani Code'], ARRAY['Calvin Klein', 'Armani', 'Hugo Boss'], '$75K-300K', 'contacted', 'high', 100000, ARRAY['fashion', 'fragrance', 'luxury']),
('James Mitchell', 'UTA (United Talent)', 'Senior Agent', 'talent_agent', 1, 'jmitchell@unitedtalent.com', 'linkedin.com/in/jamesmitchelluta', ARRAY['Audi e-tron', 'Tag Heuer Monaco'], ARRAY['Audi', 'Tag Heuer', 'Boss'], '$60K-250K', 'research', 'high', 80000, ARRAY['automotive', 'watches', 'fashion']),

-- Tier 1 Directors
('Christopher Nolan Jr', 'Nolan Productions', 'Commercial Director', 'commercial_director', 1, 'chris@nolanproductions.com', 'linkedin.com/in/chrisnolanjr', ARRAY['BMW Ultimate Machine', 'Rolex Perpetual'], ARRAY['BMW', 'Rolex', 'Hennessy'], '$200K+', 'research', 'urgent', 200000, ARRAY['luxury', 'automotive', 'spirits']),
('Sofia Martinez', 'Vision Studios', 'Fashion Film Director', 'commercial_director', 1, 'sofia@visionstudios.com', 'linkedin.com/in/sofiamartinezvision', ARRAY['Chanel No 5', 'Prada Luna Rossa'], ARRAY['Chanel', 'Prada', 'Burberry'], '$150K+', 'meeting', 'high', 150000, ARRAY['fashion', 'fragrance', 'luxury']),

-- Tier 2 Casting Directors
('Brian Foster', 'Foster Casting LA', 'Casting Director', 'casting_director', 2, 'brian@fostercastingla.com', 'linkedin.com/in/brianfostercasting', ARRAY['Toyota Camry', 'Macy''s Holiday', 'Banana Republic'], ARRAY['Toyota', 'Macy''s', 'Banana Republic'], '$10K-75K', 'followed', 'medium', 25000, ARRAY['commercial', 'retail', 'automotive']),
('Nicole Adams', 'Adams Casting', 'Owner', 'casting_director', 2, 'nicole@adamscasting.com', 'linkedin.com/in/nicoleadamscasting', ARRAY['Gap Fall Collection', 'Nordstrom Anniversary'], ARRAY['Gap', 'Nordstrom', 'J.Crew'], '$15K-50K', 'research', 'medium', 20000, ARRAY['retail', 'fashion', 'commercial']),
('Robert Kim', 'Kim Casting Services', 'Lead Casting', 'casting_director', 2, 'robert@kimcasting.com', 'linkedin.com/in/robertkimcasting', ARRAY['Honda Accord', 'Target Style', 'Uniqlo US'], ARRAY['Honda', 'Target', 'Uniqlo'], '$10K-60K', 'contacted', 'medium', 18000, ARRAY['automotive', 'retail', 'fashion']),
('Lisa Thompson', 'Thompson Talent', 'Casting Director', 'casting_director', 2, 'lisa@thompsontalent.com', 'linkedin.com/in/lisathompsoncasting', ARRAY['Levi''s 501', 'Converse All Stars', 'Adidas Originals'], ARRAY['Levi''s', 'Converse', 'Adidas'], '$20K-80K', 'dmed', 'high', 30000, ARRAY['streetwear', 'fashion', 'athletic']),
('Kevin Wright', 'Wright Way Casting', 'Director', 'casting_director', 2, 'kevin@wrightwaycast.com', 'linkedin.com/in/kevinwrightcast', ARRAY['Ford F-150', 'Home Depot Pro', 'Lowe''s Spring'], ARRAY['Ford', 'Home Depot', 'Lowe''s'], '$15K-45K', 'research', 'low', 15000, ARRAY['automotive', 'home', 'commercial']),
('Michelle Lee', 'Lee Casting NYC', 'Senior Casting', 'casting_director', 2, 'michelle@leecastingnyc.com', 'linkedin.com/in/michellelee casting', ARRAY['Zara Man', 'H&M Studio', 'ASOS'], ARRAY['Zara', 'H&M', 'ASOS'], '$8K-40K', 'followed', 'medium', 15000, ARRAY['fast-fashion', 'e-commerce', 'retail']),
('Anthony Rivera', 'Rivera Casting', 'Founder', 'casting_director', 2, 'anthony@riveracasting.com', 'linkedin.com/in/anthonyriveracast', ARRAY['Old Navy Summer', 'American Eagle Outfitters'], ARRAY['Old Navy', 'American Eagle', 'Abercrombie'], '$10K-35K', 'research', 'low', 12000, ARRAY['retail', 'youth', 'casual']),
('Jessica Brown', 'JB Casting', 'Principal', 'casting_director', 2, 'jessica@jbcasting.com', 'linkedin.com/in/jessicabrowncasting', ARRAY['Under Armour Training', 'New Balance Fresh Foam'], ARRAY['Under Armour', 'New Balance', 'Reebok'], '$25K-100K', 'contacted', 'high', 35000, ARRAY['athletic', 'sports', 'fitness']),
('Daniel Garcia', 'Garcia Casting Co', 'Director', 'casting_director', 2, 'daniel@garciacasting.com', 'linkedin.com/in/danielgarciacast', ARRAY['Coca-Cola Summer', 'Pepsi Zero', 'Mountain Dew'], ARRAY['Coca-Cola', 'Pepsi', 'Mountain Dew'], '$20K-60K', 'meeting', 'medium', 25000, ARRAY['beverages', 'commercial', 'lifestyle']),
('Stephanie White', 'White Label Casting', 'Owner', 'casting_director', 2, 'stephanie@whitelabelcast.com', 'linkedin.com/in/stephaniewhitecast', ARRAY['Samsung Galaxy', 'Google Pixel', 'OnePlus'], ARRAY['Samsung', 'Google', 'OnePlus'], '$30K-90K', 'research', 'high', 40000, ARRAY['tech', 'mobile', 'commercial']),

-- Tier 2 Talent Agents  
('Patrick O''Brien', 'Paradigm Talent', 'Commercial Agent', 'talent_agent', 2, 'pobrien@paradigm.com', 'linkedin.com/in/patrickobrienpara', ARRAY['Express Men', 'Perry Ellis'], ARRAY['Express', 'Perry Ellis', 'Van Heusen'], '$15K-60K', 'research', 'medium', 20000, ARRAY['fashion', 'commercial', 'menswear']),
('Christina Nguyen', 'APA Agency', 'Talent Agent', 'talent_agent', 2, 'cnguyen@apa-agency.com', 'linkedin.com/in/christinanguyenapa', ARRAY['Sephora Beauty', 'Ulta Gorgeous Hair'], ARRAY['Sephora', 'Ulta', 'MAC'], '$20K-80K', 'contacted', 'high', 30000, ARRAY['beauty', 'cosmetics', 'lifestyle']),
('Ryan Taylor', 'ICM Partners', 'Jr. Agent', 'talent_agent', 2, 'rtaylor@icmpartners.com', 'linkedin.com/in/ryantayloricm', ARRAY['Allstate Insurance', 'State Farm'], ARRAY['Allstate', 'State Farm', 'Progressive'], '$10K-50K', 'research', 'low', 15000, ARRAY['insurance', 'commercial', 'voiceover']),

-- Tier 2 Directors
('Andrew Collins', 'Collins Creative', 'Director', 'commercial_director', 2, 'andrew@collinscreative.com', 'linkedin.com/in/andrewcollinsdirector', ARRAY['Hyundai Sonata', 'Kia Sportage'], ARRAY['Hyundai', 'Kia', 'Genesis'], '$40K-120K', 'contacted', 'medium', 45000, ARRAY['automotive', 'commercial', 'lifestyle']),
('Emily Rodriguez', 'Rodriguez Films', 'Creative Director', 'commercial_director', 2, 'emily@rodriguezfilms.com', 'linkedin.com/in/emilyrodriguezfilms', ARRAY['Dove Real Beauty', 'Olay Regenerist'], ARRAY['Dove', 'Olay', 'Neutrogena'], '$30K-100K', 'meeting', 'high', 40000, ARRAY['beauty', 'skincare', 'lifestyle']),
('Jason Moore', 'Moore Motion Pictures', 'Director', 'commercial_director', 2, 'jason@mooremotion.com', 'linkedin.com/in/jasonmooredirector', ARRAY['Bud Light Super Bowl', 'Michelob Ultra'], ARRAY['Bud Light', 'Michelob', 'Stella Artois'], '$50K-150K', 'research', 'high', 55000, ARRAY['beverages', 'sports', 'lifestyle']),

-- Tier 3 Casting Directors (Emerging/Regional)
('Ashley Turner', 'Turner Casting ATL', 'Casting Director', 'casting_director', 3, 'ashley@turnercastingatl.com', 'linkedin.com/in/ashleyturnercasting', ARRAY['Local Atlanta Commercials', 'Regional Retail'], ARRAY['Publix', 'Waffle House', 'Chick-fil-A'], '$2K-15K', 'research', 'low', 5000, ARRAY['regional', 'retail', 'food']),
('Mark Davis', 'Davis Casting Chicago', 'Owner', 'casting_director', 3, 'mark@daviscastingchi.com', 'linkedin.com/in/markdaviscasting', ARRAY['Midwest Auto Dealers', 'Chicago Tourism'], ARRAY['Visit Chicago', 'United Center'], '$3K-20K', 'contacted', 'low', 6000, ARRAY['regional', 'tourism', 'sports']),
('Rachel Green', 'Green Light Casting', 'Founder', 'casting_director', 3, 'rachel@greenlightcast.com', 'linkedin.com/in/rachelgreencasting', ARRAY['San Diego Zoo', 'SeaWorld'], ARRAY['San Diego Tourism', 'SeaWorld'], '$2K-12K', 'followed', 'medium', 4000, ARRAY['tourism', 'family', 'regional']),
('Tom Henderson', 'Henderson Casting Miami', 'Director', 'casting_director', 3, 'tom@hendersoncastingmiami.com', 'linkedin.com/in/tomhendersoncasting', ARRAY['Miami Beach Hotels', 'FL Tourism'], ARRAY['Visit Florida', 'Fontainebleau'], '$5K-25K', 'research', 'medium', 8000, ARRAY['tourism', 'hospitality', 'lifestyle']),
('Karen Mitchell', 'Mitchell & Co Casting', 'Principal', 'casting_director', 3, 'karen@mitchellcocasting.com', 'linkedin.com/in/karenmitchellcasting', ARRAY['Local Furniture Stores', 'Regional Banks'], ARRAY['Regions Bank', 'SunTrust'], '$1K-10K', 'research', 'low', 3000, ARRAY['regional', 'finance', 'retail']),

-- Tier 1 Ad Agency Creative Directors
('Alexandra Romano', 'BBDO Worldwide', 'Group Creative Director', 'creative_director', 1, 'aromano@bbdo.com', 'linkedin.com/in/alexandraromanobbdo', ARRAY['AT&T "More For Your Thing"', 'Snickers "You''re Not You"'], ARRAY['AT&T', 'Snickers', 'Pedigree'], '$100K+', 'research', 'urgent', 120000, ARRAY['telecom', 'food', 'mass-market']),
('Jonathan Wells', 'Wieden+Kennedy', 'Executive Creative Director', 'creative_director', 1, 'jwells@wk.com', 'linkedin.com/in/jonathanwellswk', ARRAY['Nike "Dream Crazy"', 'Old Spice "The Man Your Man Could Smell Like"'], ARRAY['Nike', 'Old Spice', 'KFC'], '$150K+', 'contacted', 'urgent', 180000, ARRAY['sports', 'personal-care', 'fast-food']),
('Catherine Park', 'Ogilvy', 'Chief Creative Officer', 'creative_director', 1, 'cpark@ogilvy.com', 'linkedin.com/in/catherineparkogilvy', ARRAY['Dove "Campaign for Real Beauty"', 'IBM Watson'], ARRAY['Dove', 'IBM', 'American Express'], '$200K+', 'meeting', 'high', 200000, ARRAY['beauty', 'tech', 'finance']),
('Benjamin Cruz', 'DDB Worldwide', 'Creative Director', 'creative_director', 1, 'bcruz@ddb.com', 'linkedin.com/in/benjamincruzddb', ARRAY['McDonald''s "I''m Lovin'' It"', 'Volkswagen "Think Small"'], ARRAY['McDonald''s', 'Volkswagen', 'State Farm'], '$80K-300K', 'research', 'high', 100000, ARRAY['fast-food', 'automotive', 'insurance']),

-- Producers
('Victoria Chang', 'RSA Films', 'Executive Producer', 'producer', 1, 'vchang@rsafilms.com', 'linkedin.com/in/victoriachangrsa', ARRAY['Hennessy "Never Stop. Never Settle"', 'Jaguar "Art of Performance"'], ARRAY['Hennessy', 'Jaguar', 'Chivas Regal'], '$150K+', 'research', 'high', 150000, ARRAY['spirits', 'automotive', 'luxury']),
('Matthew Stone', 'MJZ', 'Producer', 'producer', 1, 'mstone@mjz.com', 'linkedin.com/in/matthewstonemjz', ARRAY['Apple "Shot on iPhone"', 'Amazon "Before Alexa"'], ARRAY['Apple', 'Amazon', 'Google'], '$200K+', 'contacted', 'urgent', 200000, ARRAY['tech', 'innovation', 'lifestyle']),
('Lauren Kim', 'Smuggler', 'Senior Producer', 'producer', 1, 'lkim@smuggler.com', 'linkedin.com/in/laurenkimsmuggler', ARRAY['Budweiser Super Bowl', 'Gatorade "Sweat"'], ARRAY['Budweiser', 'Gatorade', 'Tide'], '$100K+', 'meeting', 'high', 120000, ARRAY['beverages', 'sports', 'household']),
('Christopher Allen', 'Anonymous Content', 'Producer', 'producer', 2, 'callen@anonymouscontent.com', 'linkedin.com/in/christopherallen producer', ARRAY['Samsung "Do What You Can''t"', 'Beats by Dre'], ARRAY['Samsung', 'Beats', 'HP'], '$60K-180K', 'research', 'medium', 70000, ARRAY['tech', 'audio', 'lifestyle']),
('Samantha Brooks', 'Park Pictures', 'Line Producer', 'producer', 2, 'sbrooks@parkpictures.com', 'linkedin.com/in/samanthabrooksprod', ARRAY['Google "Year in Search"', 'Verizon 5G'], ARRAY['Google', 'Verizon', 'T-Mobile'], '$40K-120K', 'followed', 'medium', 50000, ARRAY['tech', 'telecom', 'digital']),

-- More Tier 2/3 entries to reach 50
('Derek Johnson', 'JJ Casting', 'Director', 'casting_director', 2, 'derek@jjcasting.com', 'linkedin.com/in/derekjjcasting', ARRAY['GNC Supplements', 'Vitamin Shoppe'], ARRAY['GNC', 'Vitamin Shoppe'], '$8K-30K', 'research', 'medium', 12000, ARRAY['fitness', 'supplements', 'health']),
('Monica Hayes', 'Hayes Casting', 'Owner', 'casting_director', 2, 'monica@hayescasting.com', 'linkedin.com/in/monicahayescasting', ARRAY['Planet Fitness', 'LA Fitness'], ARRAY['Planet Fitness', 'LA Fitness', '24 Hour'], '$10K-40K', 'contacted', 'medium', 15000, ARRAY['fitness', 'gym', 'lifestyle']),
('William Turner', 'Turner Models', 'Agent', 'talent_agent', 2, 'william@turnermodels.com', 'linkedin.com/in/williamturnermodels', ARRAY['Finish Line', 'Foot Locker'], ARRAY['Finish Line', 'Foot Locker', 'Champs'], '$12K-50K', 'research', 'medium', 18000, ARRAY['athletic', 'sneakers', 'youth']),
('Isabella Martinez', 'IM Casting', 'Casting Director', 'casting_director', 3, 'isabella@imcasting.com', 'linkedin.com/in/isabellamcasting', ARRAY['Local Car Dealerships', 'Regional Furniture'], ARRAY['Local Dealers'], '$1K-8K', 'research', 'low', 3000, ARRAY['regional', 'automotive', 'retail']),
('Nathan Scott', 'Scott Casting SF', 'Director', 'casting_director', 2, 'nathan@scottcastingsf.com', 'linkedin.com/in/nathanscottcasting', ARRAY['Salesforce Dreamforce', 'Slack'], ARRAY['Salesforce', 'Slack', 'Dropbox'], '$25K-80K', 'meeting', 'high', 35000, ARRAY['tech', 'B2B', 'SaaS']),
('Hannah Wilson', 'Wilson Talent', 'Agent', 'talent_agent', 3, 'hannah@wilsontalent.com', 'linkedin.com/in/hannahwilsontalent', ARRAY['Local Theater', 'Regional Print'], ARRAY['Various Regional'], '$2K-15K', 'research', 'low', 5000, ARRAY['regional', 'theater', 'print']),
('Gregory Phillips', 'Phillips Casting Austin', 'Owner', 'casting_director', 3, 'gregory@phillipscastingaustin.com', 'linkedin.com/in/gregoryphillipscasting', ARRAY['SXSW Sponsors', 'Dell Technologies'], ARRAY['Dell', 'SXSW', 'Whole Foods'], '$5K-25K', 'contacted', 'medium', 8000, ARRAY['tech', 'events', 'retail']);

-- ==========================================
-- AD AGENCIES (30 entries)
-- ==========================================

INSERT INTO ad_agencies (name, type, headquarters, website, tier, luxury_clients, fashion_clients, automotive_clients, lifestyle_clients, annual_billings, notable_campaigns, submission_email, status) VALUES
-- Tier 1 Major Agencies
('BBDO Worldwide', 'ad_agency', 'New York, NY', 'bbdo.com', 1, ARRAY['Emirates', 'Rolex Partners'], ARRAY['Foot Locker', 'Finish Line'], ARRAY['Mercedes-Benz', 'Chrysler'], ARRAY['Pepsi', 'Snickers', 'GE'], '$15B+', ARRAY['AT&T "More For Your Thing"', 'Snickers "You''re Not You"', 'Guinness "Made of More"'], 'talent@bbdo.com', 'research'),
('Wieden+Kennedy', 'ad_agency', 'Portland, OR', 'wk.com', 1, ARRAY['Nike Premium'], ARRAY['Nike', 'Levi''s'], ARRAY['Ford', 'Honda'], ARRAY['Nike', 'Old Spice', 'Coca-Cola'], '$1.5B+', ARRAY['Nike "Just Do It"', 'Old Spice "The Man Your Man Could Smell Like"'], 'casting@wk.com', 'contacted'),
('Ogilvy', 'ad_agency', 'New York, NY', 'ogilvy.com', 1, ARRAY['Rolex', 'Louis Vuitton'], ARRAY['Dove', 'Lacoste'], ARRAY['BMW', 'Jaguar'], ARRAY['Dove', 'American Express', 'IBM'], '$12B+', ARRAY['Dove "Campaign for Real Beauty"', 'IBM Watson'], 'submissions@ogilvy.com', 'meeting'),
('DDB Worldwide', 'ad_agency', 'New York, NY', 'ddb.com', 1, ARRAY['Audi'], ARRAY['Uniqlo'], ARRAY['Volkswagen', 'Audi'], ARRAY['McDonald''s', 'Mars', 'State Farm'], '$3.3B+', ARRAY['Volkswagen "Think Small"', 'McDonald''s "I''m Lovin'' It"'], 'talent@ddb.com', 'research'),
('McCann Worldgroup', 'ad_agency', 'New York, NY', 'mccann.com', 1, ARRAY['L''Oreal Luxe'], ARRAY['L''Oreal'], ARRAY['GM', 'Chevrolet'], ARRAY['Mastercard', 'Microsoft', 'Coca-Cola'], '$8B+', ARRAY['Mastercard "Priceless"', 'L''Oreal "Because You''re Worth It"'], 'casting@mccann.com', 'research'),
('Grey Group', 'ad_agency', 'New York, NY', 'grey.com', 1, ARRAY['Cartier'], ARRAY['Victoria''s Secret'], ARRAY['Volvo'], ARRAY['P&G', 'Canon', 'Gillette'], '$2.5B+', ARRAY['Gillette "The Best a Man Can Get"', 'Febreze'], 'talent@grey.com', 'contacted'),
('Leo Burnett', 'ad_agency', 'Chicago, IL', 'leoburnett.com', 1, ARRAY['Samsung Premium'], ARRAY['Always'], ARRAY['Fiat', 'Jeep'], ARRAY['Samsung', 'McDonald''s', 'Kellogg''s'], '$1.2B+', ARRAY['Always "#LikeAGirl"', 'McDonald''s Mascots'], 'submissions@leoburnett.com', 'research'),
('Saatchi & Saatchi', 'ad_agency', 'New York, NY', 'saatchi.com', 1, ARRAY['Lexus'], ARRAY['Head & Shoulders'], ARRAY['Toyota', 'Lexus'], ARRAY['P&G', 'T-Mobile', 'Visa'], '$2B+', ARRAY['Toyota "Let''s Go Places"', 'T-Mobile Super Bowl'], 'talent@saatchi.com', 'meeting'),

-- Tier 1 Talent Agencies
('CAA (Creative Artists Agency)', 'talent_agency', 'Los Angeles, CA', 'caa.com', 1, ARRAY['High-Net-Worth Talent'], ARRAY['Fashion Week Talent'], ARRAY['Super Bowl Talent'], ARRAY['Celebrity Endorsements'], '$400M+', ARRAY['Super Bowl Celebrity Placements', 'Olympic Sponsorships'], 'commercial@caa.com', 'research'),
('WME (William Morris Endeavor)', 'talent_agency', 'Beverly Hills, CA', 'wmeagency.com', 1, ARRAY['Luxury Brand Ambassadors'], ARRAY['Top Models'], ARRAY['Automotive Spokespeople'], ARRAY['Brand Partnerships'], '$350M+', ARRAY['Calvin Klein Campaigns', 'Nike Athlete Endorsements'], 'models@wme.com', 'contacted'),
('UTA (United Talent Agency)', 'talent_agency', 'Beverly Hills, CA', 'unitedtalent.com', 1, ARRAY['Premium Talent'], ARRAY['Designer Collaborations'], ARRAY['Car Launch Talent'], ARRAY['Lifestyle Influencers'], '$280M+', ARRAY['Fashion Brand Ambassadors'], 'talent@uta.com', 'research'),
('ICM Partners', 'talent_agency', 'Los Angeles, CA', 'icmpartners.com', 1, ARRAY['Luxury Endorsements'], ARRAY['Fashion Talent'], ARRAY['Auto Show Hosts'], ARRAY['Commercial Talent'], '$200M+', ARRAY['Commercial Placements'], 'commercial@icmpartners.com', 'research'),

-- Tier 2 Agencies
('Droga5', 'ad_agency', 'New York, NY', 'droga5.com', 2, ARRAY['Hennessy'], ARRAY['Under Armour'], ARRAY['Prudential'], ARRAY['The New York Times', 'Mailchimp'], '$100M+', ARRAY['Under Armour "I Will What I Want"', 'Hennessy Wild Rabbit'], 'info@droga5.com', 'contacted'),
('72andSunny', 'ad_agency', 'Los Angeles, CA', '72andsunny.com', 2, ARRAY['Tillamook'], ARRAY['Adidas'], ARRAY['General Motors'], ARRAY['Samsung', 'Google', 'Activision'], '$150M+', ARRAY['Adidas "Impossible is Nothing"', 'Samsung Galaxy'], 'talent@72andsunny.com', 'research'),
('GSD&M', 'ad_agency', 'Austin, TX', 'gsdm.com', 2, ARRAY['USAA Premium'], ARRAY['Kohler'], ARRAY['BMW Motorcycles'], ARRAY['Southwest Airlines', 'USAA', 'PGA Tour'], '$70M+', ARRAY['Southwest "Wanna Get Away"'], 'casting@gsdm.com', 'research'),
('Anomaly', 'ad_agency', 'New York, NY', 'anomaly.com', 2, ARRAY['Johnnie Walker'], ARRAY['Converse'], ARRAY['Harley-Davidson'], ARRAY['Budweiser', 'Dick''s Sporting Goods'], '$80M+', ARRAY['Budweiser Clydesdales', 'Converse Collaborations'], 'info@anomaly.com', 'followed'),
('R/GA', 'ad_agency', 'New York, NY', 'rga.com', 2, ARRAY['Samsung Premium'], ARRAY['Nike Digital'], ARRAY['Audi Innovation'], ARRAY['Google', 'Nike', 'Samsung'], '$200M+', ARRAY['Nike FuelBand', 'Google Pay'], 'talent@rga.com', 'meeting'),
('AKQA', 'ad_agency', 'San Francisco, CA', 'akqa.com', 2, ARRAY['Audi Digital'], ARRAY['Nike.com'], ARRAY['Volvo Digital'], ARRAY['Nike', 'Verizon', 'Visa'], '$180M+', ARRAY['Nike+ Running', 'Audi Experience'], 'info@akqa.com', 'research'),
('The Martin Agency', 'ad_agency', 'Richmond, VA', 'martinagency.com', 2, ARRAY['Oreo Premium'], ARRAY['Hanes'], ARRAY['Discover'], ARRAY['Geico', 'Oreo', 'Walmart'], '$90M+', ARRAY['Geico Gecko', 'Oreo "Dunk in the Dark"'], 'talent@martinagency.com', 'contacted'),
('VaynerMedia', 'ad_agency', 'New York, NY', 'vaynermedia.com', 2, ARRAY['Wine Library'], ARRAY['Chase'], ARRAY['Toyota Digital'], ARRAY['PepsiCo', 'Chase', 'Unilever'], '$150M+', ARRAY['PepsiCo Social', 'Chase Digital'], 'casting@vaynermedia.com', 'research'),

-- Production Companies
('RSA Films', 'production_company', 'Los Angeles, CA', 'rsafilms.com', 1, ARRAY['Hennessy', 'Chivas'], ARRAY['Burberry', 'Prada Films'], ARRAY['Jaguar', 'Land Rover'], ARRAY['Hennessy', 'Jaguar', 'Chanel'], '$50M+', ARRAY['Apple "1984"', 'Hennessy X.O'], 'talent@rsafilms.com', 'research'),
('MJZ', 'production_company', 'Los Angeles, CA', 'mjz.com', 1, ARRAY['Apple'], ARRAY['H&M'], ARRAY['Honda'], ARRAY['Apple', 'Amazon', 'Google'], '$60M+', ARRAY['Apple "Shot on iPhone"', 'Amazon Super Bowl'], 'casting@mjz.com', 'contacted'),
('Smuggler', 'production_company', 'New York, NY', 'smuggler.com', 1, ARRAY['Gatorade Premium'], ARRAY['Levi''s'], ARRAY['Audi Films'], ARRAY['Gatorade', 'Budweiser', 'Tide'], '$40M+', ARRAY['Budweiser "Puppy Love"', 'Gatorade "Sweat"'], 'talent@smuggler.com', 'meeting'),
('Anonymous Content', 'production_company', 'Los Angeles, CA', 'anonymouscontent.com', 1, ARRAY['Samsung'], ARRAY['Gap'], ARRAY['BMW'], ARRAY['Samsung', 'HP', 'Beats'], '$45M+', ARRAY['Samsung "Do What You Can''t"'], 'info@anonymouscontent.com', 'research'),
('Park Pictures', 'production_company', 'New York, NY', 'parkpictures.com', 2, ARRAY['Google'], ARRAY['Target Style'], ARRAY['Subaru'], ARRAY['Google', 'Verizon', 'AT&T'], '$30M+', ARRAY['Google "Year in Search"'], 'talent@parkpictures.com', 'contacted'),

-- Casting Agencies
('Breakdown Services', 'casting_agency', 'Los Angeles, CA', 'breakdownservices.com', 1, ARRAY['Industry Standard'], ARRAY['All Fashion'], ARRAY['All Automotive'], ARRAY['Industry-Wide'], 'N/A', ARRAY['Industry Submission Platform'], 'support@breakdownservices.com', 'relationship'),
('Casting Networks', 'casting_agency', 'Los Angeles, CA', 'castingnetworks.com', 1, ARRAY['Cross-Industry'], ARRAY['Print & Digital'], ARRAY['Commercial Auto'], ARRAY['Commercial, Print, Digital'], 'N/A', ARRAY['Casting Platform'], 'support@castingnetworks.com', 'relationship'),
('Backstage', 'casting_agency', 'New York, NY', 'backstage.com', 2, ARRAY['Theater'], ARRAY['Print Modeling'], ARRAY['Student Films'], ARRAY['Theater, Film, Commercial'], 'N/A', ARRAY['Casting Calls Platform'], 'support@backstage.com', 'relationship'),
('Model Mayhem', 'casting_agency', 'San Francisco, CA', 'modelmayhem.com', 3, ARRAY['TFP'], ARRAY['Emerging Designers'], ARRAY['Local Shoots'], ARRAY['Photography, Modeling'], 'N/A', ARRAY['Model Portfolio Platform'], 'support@modelmayhem.com', 'research');

-- ==========================================
-- MARKETING LEADS (50 entries)
-- ==========================================

INSERT INTO marketing_leads (brand_name, instagram_handle, contact_name, contact_email, website, brand_description, price_point, brand_aesthetic, potential_revenue, status, notes, tags, followers_count, priority) VALUES
-- Luxury Brands
('Maison de Luxe', 'maisondeluxe', 'Pierre Fontaine', 'pierre@maisondeluxe.com', 'maisondeluxe.com', 'French luxury accessories and leather goods', 'luxury', 'Parisian elegance, timeless', 15000, 'discovered', 'High-end brand, great fit for editorial content', ARRAY['luxury', 'accessories', 'french'], 450000, 'urgent'),
('Aurum Timepieces', 'aurumtimepieces', 'Sebastian Gold', 'sebastian@aurum.watch', 'aurum.watch', 'Swiss-made luxury watches', 'luxury', 'Classic, sophisticated', 20000, 'followed', 'Premium watch brand seeking male models', ARRAY['luxury', 'watches', 'swiss'], 280000, 'urgent'),
('Velvet & Stone', 'velvetandstone', 'Isabella Chen', 'isabella@velvetstone.com', 'velvetstone.com', 'Luxury jewelry and gemstones', 'luxury', 'Modern luxury, editorial', 12000, 'dmed', 'Looking for diverse models for campaign', ARRAY['luxury', 'jewelry', 'editorial'], 320000, 'high'),
('Casa di Moda', 'casadimoda', 'Marco Rossi', 'marco@casadimoda.it', 'casadimoda.it', 'Italian fashion house', 'luxury', 'Italian craftsmanship, bold', 25000, 'negotiating', 'SS25 campaign budget confirmed', ARRAY['luxury', 'fashion', 'italian'], 520000, 'urgent'),
('Noir Collection', 'noircollection', 'Alexandra Black', 'alex@noircollection.com', 'noircollection.com', 'Dark luxury streetwear', 'luxury', 'Avant-garde, dark aesthetic', 10000, 'discovered', 'Edgy brand, urban shoots', ARRAY['luxury', 'streetwear', 'avant-garde'], 180000, 'high'),

-- Premium Brands
('Urban Collective', 'urbancollective', 'Jake Morrison', 'jake@urbancollective.co', 'urbancollective.co', 'Premium streetwear collective', 'premium', 'Urban, artistic, street culture', 5000, 'followed', 'NYC-based, great for street style', ARRAY['premium', 'streetwear', 'urban'], 420000, 'high'),
('Coastal Athletics', 'coastalathletics', 'Sarah Wave', 'sarah@coastalathletics.com', 'coastalathletics.com', 'Luxury athletic wear', 'premium', 'Beach, fitness, wellness', 6000, 'dmed', 'San Diego brand, perfect fit', ARRAY['premium', 'athletic', 'beach'], 290000, 'high'),
('Mountain Luxe', 'mountainluxe', 'Chris Summit', 'chris@mountainluxe.com', 'mountainluxe.com', 'Premium outdoor apparel', 'premium', 'Adventure, nature, premium', 5500, 'replied', 'Interested in outdoor campaign', ARRAY['premium', 'outdoor', 'adventure'], 340000, 'high'),
('Studio Nine', 'studionine', 'Nina Park', 'nina@studionine.design', 'studionine.design', 'Minimalist fashion brand', 'premium', 'Clean, minimalist, architectural', 4500, 'negotiating', 'Budget approved for Q2', ARRAY['premium', 'minimalist', 'design'], 156000, 'high'),
('Golden Hour LA', 'goldenhourla', 'Sunset Studios', 'booking@goldenhourla.com', 'goldenhourla.com', 'California lifestyle brand', 'premium', 'Golden, warm, California', 4000, 'booked', 'Shoot confirmed for March 15', ARRAY['premium', 'lifestyle', 'california'], 380000, 'medium'),
('Atlas Menswear', 'atlasmenswear', 'David Atlas', 'david@atlasmenswear.com', 'atlasmenswear.com', 'Modern menswear essentials', 'premium', 'Clean, modern, masculine', 5000, 'discovered', 'Expanding into social campaigns', ARRAY['premium', 'menswear', 'modern'], 210000, 'high'),
('Elevate Fitness', 'elevatefitness', 'Mike Strong', 'mike@elevatefitness.co', 'elevatefitness.co', 'Premium gym apparel', 'premium', 'Athletic, powerful, motivation', 4500, 'followed', 'Looking for fitness models', ARRAY['premium', 'fitness', 'athletic'], 520000, 'high'),
('Zen Garden Skincare', 'zengardenskin', 'Lily Chen', 'lily@zengarden.care', 'zengarden.care', 'Natural luxury skincare', 'premium', 'Clean, natural, zen', 6000, 'dmed', 'Male skincare ambassador search', ARRAY['premium', 'skincare', 'natural'], 185000, 'medium'),
('Nordic Style', 'nordicstyleco', 'Erik Larsen', 'erik@nordicstyle.co', 'nordicstyle.co', 'Scandinavian fashion', 'premium', 'Minimalist, nordic, clean', 5500, 'replied', 'Confirmed interest via DM', ARRAY['premium', 'scandinavian', 'minimalist'], 290000, 'high'),
('Rebel & Rose', 'rebelandrose', 'Rose Knight', 'rose@rebelandrose.com', 'rebelandrose.com', 'Rock-inspired fashion', 'premium', 'Edgy, rock, rebel', 4000, 'discovered', 'Music festival brand', ARRAY['premium', 'rock', 'festival'], 340000, 'medium'),

-- Mid-Range Brands
('Streetwear Society', 'streetwearsociety', 'Jay Street', 'jay@streetwearsociety.com', 'streetwearsociety.com', 'Accessible streetwear', 'mid-range', 'Street, urban, accessible', 2500, 'discovered', 'Growing streetwear brand', ARRAY['mid-range', 'streetwear', 'urban'], 890000, 'medium'),
('Sunset Beach Co', 'sunsetbeachco', 'Beach Life', 'hello@sunsetbeach.co', 'sunsetbeach.co', 'Beach lifestyle brand', 'mid-range', 'Relaxed, beach, summer', 2000, 'followed', 'Perfect for lifestyle content', ARRAY['mid-range', 'beach', 'lifestyle'], 560000, 'medium'),
('Daily Threads', 'dailythreadsco', 'Emma Thread', 'emma@dailythreads.co', 'dailythreads.co', 'Everyday essentials', 'mid-range', 'Casual, comfortable, everyday', 1800, 'dmed', 'Consistent content needs', ARRAY['mid-range', 'essentials', 'casual'], 420000, 'medium'),
('Active Motion', 'activemotion', 'Active Team', 'casting@activemotion.fit', 'activemotion.fit', 'Affordable athletic wear', 'mid-range', 'Athletic, active, energetic', 2200, 'replied', 'Monthly content contract possible', ARRAY['mid-range', 'athletic', 'fitness'], 780000, 'high'),
('Modern Man Co', 'modernmanco', 'Max Modern', 'max@modernman.co', 'modernman.co', 'Contemporary menswear', 'mid-range', 'Modern, clean, professional', 2000, 'negotiating', 'Quarterly campaign discussion', ARRAY['mid-range', 'menswear', 'professional'], 340000, 'high'),
('Surf Culture', 'surfcultureco', 'Wave Rider', 'hello@surfculture.co', 'surfculture.co', 'Surf-inspired apparel', 'mid-range', 'Surf, ocean, laid-back', 1500, 'discovered', 'San Diego local brand', ARRAY['mid-range', 'surf', 'local'], 290000, 'medium'),
('Cali Vibes', 'californiavibesco', 'Cali Team', 'team@californiavibesco.com', 'californiavibesco.com', 'California lifestyle', 'mid-range', 'Sunny, positive, California', 1800, 'followed', 'Looking for CA-based models', ARRAY['mid-range', 'california', 'lifestyle'], 410000, 'medium'),
('Fresh Kicks', 'freshkicksco', 'Sneaker Head', 'hello@freshkicks.co', 'freshkicks.co', 'Sneaker culture brand', 'mid-range', 'Sneakers, street, culture', 2000, 'dmed', 'Sneaker campaign coming up', ARRAY['mid-range', 'sneakers', 'street'], 650000, 'medium'),
('Gym Bros Apparel', 'gymbrosapparel', 'Gym Bros', 'casting@gymbros.com', 'gymbros.com', 'Gym lifestyle brand', 'mid-range', 'Fitness, motivation, gym', 1500, 'replied', 'Fitness model search', ARRAY['mid-range', 'gym', 'fitness'], 920000, 'high'),
('Boardwalk Brand', 'boardwalkbrand', 'Board Life', 'hello@boardwalkbrand.com', 'boardwalkbrand.com', 'Skateboard culture', 'mid-range', 'Skate, urban, youth', 1200, 'discovered', 'Skate culture content', ARRAY['mid-range', 'skate', 'urban'], 380000, 'low'),
('Vintage Revival', 'vintagerevivalco', 'Retro Style', 'hello@vintagerevival.co', 'vintagerevival.co', 'Vintage-inspired fashion', 'mid-range', 'Retro, vintage, nostalgic', 1800, 'followed', 'Unique aesthetic', ARRAY['mid-range', 'vintage', 'retro'], 290000, 'medium'),
('Eco Threads', 'ecothreadsco', 'Green Fashion', 'hello@ecothreads.co', 'ecothreads.co', 'Sustainable fashion', 'mid-range', 'Eco, sustainable, conscious', 2200, 'dmed', 'Sustainability focus', ARRAY['mid-range', 'sustainable', 'eco'], 340000, 'medium'),
('Night Owl Clothing', 'nightowlclothing', 'Night Team', 'hello@nightowl.clothing', 'nightowl.clothing', 'Nightlife fashion', 'mid-range', 'Night, urban, party', 1500, 'discovered', 'Nightlife content', ARRAY['mid-range', 'nightlife', 'party'], 420000, 'low'),
('West Coast Denim', 'westcoastdenim', 'Denim Team', 'hello@westcoastdenim.com', 'westcoastdenim.com', 'Premium denim brand', 'mid-range', 'Denim, casual, west coast', 2500, 'followed', 'Denim campaign Q2', ARRAY['mid-range', 'denim', 'casual'], 280000, 'medium'),
('Island Time', 'islandtimeco', 'Island Vibes', 'hello@islandtime.co', 'islandtime.co', 'Tropical lifestyle', 'mid-range', 'Tropical, vacation, relaxed', 1800, 'dmed', 'Tropical shoot opportunity', ARRAY['mid-range', 'tropical', 'vacation'], 310000, 'medium'),

-- Budget Brands (Volume Opportunities)
('Fast Fashion Finds', 'fastfashionfinds', 'FF Team', 'casting@fastfashionfinds.com', 'fastfashionfinds.com', 'Trendy affordable fashion', 'budget', 'Trendy, fast, affordable', 800, 'discovered', 'High volume content needs', ARRAY['budget', 'fast-fashion', 'trendy'], 1200000, 'low'),
('Budget Basics', 'budgetbasicsco', 'Basics Team', 'hello@budgetbasics.co', 'budgetbasics.co', 'Affordable essentials', 'budget', 'Basic, affordable, simple', 600, 'followed', 'Regular content rotation', ARRAY['budget', 'basics', 'affordable'], 890000, 'low'),
('Street Value', 'streetvalueco', 'SV Team', 'hello@streetvalue.co', 'streetvalue.co', 'Affordable streetwear', 'budget', 'Street, value, youth', 750, 'dmed', 'Youth marketing focus', ARRAY['budget', 'streetwear', 'value'], 780000, 'low'),
('Fit For Less', 'fitforless', 'Fitness Value', 'hello@fitforless.com', 'fitforless.com', 'Budget gym wear', 'budget', 'Fitness, affordable, motivated', 700, 'discovered', 'Gym content volume', ARRAY['budget', 'fitness', 'affordable'], 650000, 'low'),
('Quick Style', 'quickstyleco', 'QS Team', 'hello@quickstyle.co', 'quickstyle.co', 'Fast fashion', 'budget', 'Quick, trendy, accessible', 500, 'discovered', 'Trend-based content', ARRAY['budget', 'fast-fashion', 'trendy'], 920000, 'low'),

-- Completed/Relationship Brands
('Momentum Athletics', 'momentumathletics', 'Tom Momentum', 'tom@momentumathletics.com', 'momentumathletics.com', 'Performance sportswear', 'premium', 'Performance, athletic, power', 6000, 'completed', 'Great experience, repeat possible', ARRAY['premium', 'athletic', 'performance'], 380000, 'medium'),
('Ocean Pacific', 'oceanpacificbrand', 'OP Team', 'hello@oceanpacific.com', 'oceanpacific.com', 'Classic surf brand', 'mid-range', 'Surf, classic, beach', 3500, 'completed', 'Finished summer campaign', ARRAY['mid-range', 'surf', 'classic'], 520000, 'medium'),
('Ascend Outdoor', 'ascendoutdoor', 'Summit Team', 'hello@ascendoutdoor.com', 'ascendoutdoor.com', 'Outdoor adventure gear', 'premium', 'Adventure, outdoor, nature', 5000, 'relationship', 'Ongoing ambassador relationship', ARRAY['premium', 'outdoor', 'adventure'], 290000, 'high'),
('Core Fitness', 'corefitnessbrand', 'Core Team', 'hello@corefitness.brand', 'corefitness.brand', 'Core athletic apparel', 'mid-range', 'Fitness, core, strength', 2800, 'relationship', 'Monthly content agreement', ARRAY['mid-range', 'fitness', 'athletic'], 410000, 'high'),
('Midnight Society', 'midnightsociety', 'MS Creative', 'creative@midnightsociety.co', 'midnightsociety.co', 'Dark luxury streetwear', 'premium', 'Dark, luxury, mysterious', 8000, 'completed', 'Excellent collaboration', ARRAY['premium', 'streetwear', 'dark'], 340000, 'high'),

-- Rejected/Inactive
('Cheap Threads', 'cheapthreads', 'CT Team', 'hello@cheapthreads.com', 'cheapthreads.com', 'Very budget fashion', 'budget', 'Cheap, basic, mass', 300, 'rejected', 'Rate too low, declined', ARRAY['budget', 'mass-market'], 450000, 'low'),
('Mass Market Mall', 'massmarketmall', 'MM Team', 'hello@massmarketmall.com', 'massmarketmall.com', 'Mall retail brand', 'budget', 'Mall, mass, retail', 400, 'rejected', 'Not aligned with portfolio', ARRAY['budget', 'mall', 'retail'], 380000, 'low'),

-- New Hot Leads
('Prestige Motors', 'prestigemotorsla', 'Auto Lux Team', 'marketing@prestigemotors.la', 'prestigemotors.la', 'Luxury car dealership', 'luxury', 'Automotive, luxury, prestige', 15000, 'discovered', 'LA luxury car dealer, high potential', ARRAY['luxury', 'automotive', 'local'], 89000, 'urgent'),
('Champagne Lifestyle', 'champagnelifestyle', 'Luxury Living', 'hello@champagnelifestyle.co', 'champagnelifestyle.co', 'Luxury lifestyle brand', 'luxury', 'Champagne, luxury, celebration', 12000, 'discovered', 'New luxury lifestyle brand', ARRAY['luxury', 'lifestyle', 'champagne'], 156000, 'urgent'),
('Royal Gentleman', 'royalgentleman', 'RG Creative', 'creative@royalgentleman.com', 'royalgentleman.com', 'Luxury menswear', 'luxury', 'Royal, gentleman, classic', 18000, 'followed', 'UK brand expanding to US', ARRAY['luxury', 'menswear', 'british'], 290000, 'urgent'),
('Silicon Valley Style', 'siliconvalleystyle', 'Tech Fashion', 'hello@svstyle.co', 'svstyle.co', 'Tech-inspired fashion', 'premium', 'Tech, modern, innovative', 4500, 'discovered', 'Tech industry fashion', ARRAY['premium', 'tech', 'modern'], 120000, 'high'),
('Art District Fashion', 'artdistrictfashion', 'ADF Team', 'hello@artdistrictfashion.com', 'artdistrictfashion.com', 'Art-inspired clothing', 'premium', 'Artistic, creative, bold', 3800, 'dmed', 'DTLA fashion brand', ARRAY['premium', 'art', 'creative'], 210000, 'high');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_entertainment_contacts_updated_at ON entertainment_contacts;
CREATE TRIGGER update_entertainment_contacts_updated_at BEFORE UPDATE ON entertainment_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ad_agencies_updated_at ON ad_agencies;
CREATE TRIGGER update_ad_agencies_updated_at BEFORE UPDATE ON ad_agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agency_contacts_updated_at ON agency_contacts;
CREATE TRIGGER update_agency_contacts_updated_at BEFORE UPDATE ON agency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketing_leads_updated_at ON marketing_leads;
CREATE TRIGGER update_marketing_leads_updated_at BEFORE UPDATE ON marketing_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
