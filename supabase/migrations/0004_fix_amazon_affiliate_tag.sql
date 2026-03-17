-- Fix Amazon affiliate URL template to use the correct Associates tag
update public.retailers
set affiliate_url_template = 'https://www.amazon.com/dp/{{asin}}?tag=priceradar05-20'
where slug = 'amazon';
