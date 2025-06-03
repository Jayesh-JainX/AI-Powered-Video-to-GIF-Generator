"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function GifPage() {
  const { id } = useParams();
  const [gif, setGif] = useState<any>(null);

  useEffect(() => {
    const fetchGif = async () => {
      const { data, error } = await supabase
        .from("gifs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error(error);
      else setGif(data);
    };

    if (id) fetchGif();
  }, [id]);

  if (!gif) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">GIF Detail</h1>
      <img src={gif.url} alt="Generated GIF" className="w-full max-w-lg" />
      <p className="mt-4 text-gray-700">{gif.prompt}</p>
    </div>
  );
}
