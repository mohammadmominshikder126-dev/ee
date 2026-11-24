interface SupportChatWidgetProps {
  whatsappNumber?: string;
  whatsappMessage?: string;
}

const DEFAULT_WHATSAPP_NUMBER = '8801619502669';
const DEFAULT_WHATSAPP_MESSAGE =
  'আসসালামু আলাইকুম আপনজন ই-শপ! আমি একটি প্রোডাক্ট সম্পর্কে জানতে / অর্ডার করতে চাই।';

export function SupportChatWidget({
  whatsappNumber = DEFAULT_WHATSAPP_NUMBER,
  whatsappMessage = DEFAULT_WHATSAPP_MESSAGE,
}: SupportChatWidgetProps) {
  const cleanNumber = whatsappNumber.replace(/\D/g, '') || DEFAULT_WHATSAPP_NUMBER;
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="আপনজন ই-শপ হোয়াটসঅ্যাপে যোগাযোগ করুন"
      title="হোয়াটসঅ্যাপে মেসেজ করুন"
      className="fixed right-3 sm:right-6 bottom-[82px] md:bottom-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-[0_6px_22px_rgba(37,211,102,0.42)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white" aria-hidden="true">
        <path d="M16.004 3.2c-7.058 0-12.8 5.742-12.8 12.8 0 2.256.59 4.462 1.71 6.404L3.1 28.8l6.564-1.722a12.74 12.74 0 0 0 6.34 1.682h.006c7.056 0 12.796-5.742 12.796-12.8 0-3.418-1.332-6.632-3.75-9.048A12.71 12.71 0 0 0 16.004 3.2Zm0 23.38h-.005a10.6 10.6 0 0 1-5.402-1.478l-.388-.23-3.896 1.022 1.04-3.798-.252-.4a10.56 10.56 0 0 1-1.622-5.656c0-5.854 4.764-10.618 10.622-10.618 2.836 0 5.502 1.106 7.506 3.112a10.55 10.55 0 0 1 3.108 7.508c0 5.856-4.764 10.618-10.611 10.618Zm5.826-7.952c-.32-.16-1.89-.932-2.182-1.038-.292-.106-.504-.16-.718.16-.212.318-.824 1.038-1.01 1.252-.186.212-.372.24-.692.08-.318-.16-1.346-.496-2.564-1.582-.948-.846-1.588-1.89-1.774-2.208-.186-.32-.02-.492.14-.652.144-.144.32-.372.478-.558.16-.186.212-.318.32-.532.106-.212.052-.4-.026-.558-.08-.16-.718-1.73-.984-2.368-.258-.622-.52-.538-.718-.548-.186-.01-.398-.01-.612-.01-.212 0-.558.08-.85.398-.292.32-1.116 1.09-1.116 2.66s1.142 3.086 1.302 3.298c.16.212 2.248 3.434 5.448 4.814.76.328 1.354.524 1.818.672.764.242 1.46.208 2.01.126.612-.092 1.89-.772 2.156-1.518.266-.744.266-1.384.186-1.518-.08-.132-.292-.212-.612-.372Z" />
      </svg>
    </a>
  );
}
