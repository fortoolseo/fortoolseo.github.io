module Jekyll
  module ImageAltFilter
    def auto_alt(input, post_title = nil)
      # Remove HTML tags and get clean text
      text = input.to_s.gsub(/<[^>]*>/, '').strip
      
      # If text is empty or too short, use post title
      if text.empty? || text.length < 20
        text = post_title.to_s if post_title
        text = "Gambar ilustrasi tentang #{text}" if text && !text.empty?
      end
      
      # Generate alt text
      if text.length > 120
        # Take first 120 characters for alt
        text = text[0..119] + "..."
      end
      
      # Clean up for alt attribute
      text.gsub!('"', "'")
      text.gsub!(/\s+/, ' ')
      
      text.empty? ? "Ilustrasi artikel SEO" : text
    end
    
    def extract_first_image_alt(content, post_title)
      # Find first image in content
      if content =~ /<img[^>]*alt="([^"]*)"[^>]*>/i
        # Return existing alt
        return $1
      elsif content =~ /<img[^>]*>/i
        # No alt found, generate from post title
        return "Gambar untuk artikel: #{post_title}"
      end
      
      # Default
      "Ilustrasi visual untuk konten"
    end
  end
end

Liquid::Template.register_filter(Jekyll::ImageAltFilter)
