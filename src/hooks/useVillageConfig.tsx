


// export const useVillageConfig = (village?: string, language: string = "en") => {
//   const [error, setError] = useState<string | null>(null);

//   let id = "4dd1a3a2-5e25-46ff-a830-e476c92865e6";

//   const { data: config, isLoading } = useQuery({
//     queryKey: ["villageConfig", id, language],
//     queryFn: () => GetVillageById({ id, language }),
//     select(data) {
//       return data.data;
//     },
//   });

//   console.log("Village Config Hook Data:", config);

//   // Normalize language code to base language (e.g., 'en-US' -> 'en')
//   // const normalizedLanguage = language.split('-')[0]

//   // useEffect(() => {
//   //   const fetchConfig = async () => {
//   //     try {
//   //       setLoading(true);
//   //       setError(null);

//   //       // If no village name specified, use static data as fallback
//   //       if (!village) {
//   //         setLoading(false);
//   //         return;
//   //       }

//   //       // Fetch village ID
//   //       const { data: villageData, error: villageError } = await supabase
//   //         .from("villages")
//   //         .select("id")
//   //         .eq("name", village)
//   //         .single();

//   //       if (villageError) {
//   //         console.error("Error fetching village:", villageError);
//   //         // Fallback to static data
//   //         setLoading(false);
//   //         return;
//   //       }

//   //       // Fetch config from database with language filter
//   //       const { data: configData, error: configError } = await supabase
//   //         .from("village_config")
//   //         .select("config_data")
//   //         .eq("village_id", villageData.id)
//   //         .eq("language", normalizedLanguage)
//   //         .maybeSingle();

//   //       if (configError) {
//   //         console.error("Error fetching config:", configError);
//   //         setError(configError.message);
//   //         // Fallback to static data
//   //       } else if (configData) {
//   //         // Handle nested config_data structure (if user saved entire payload)
//   //         let parsedConfig = configData.config_data as any;
//   //         if (parsedConfig?.config_data) {
//   //           // Data is double-nested, unwrap it
//   //           parsedConfig = parsedConfig.config_data;
//   //         }
//   //         setConfig(parsedConfig);
//   //       } else {
//   //         // No config in database, use static data
//   //       }
//   //     } catch (err) {
//   //       console.error("Error in fetchConfig:", err);
//   //       setError(err instanceof Error ? err.message : "Unknown error");
//   //       // Fallback to static data
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchConfig();

//   //   // Set up real-time subscription for village config updates
//   //   const channel = supabase
//   //     .channel("village-config-changes")
//   //     .on(
//   //       "postgres_changes",
//   //       {
//   //         event: "*",
//   //         schema: "public",
//   //         table: "village_config",
//   //       },
//   //       (payload) => {
//   //         if (
//   //           payload.eventType === "UPDATE" ||
//   //           payload.eventType === "INSERT"
//   //         ) {
//   //           const newData = payload.new as any;
//   //           let parsedConfig = newData.config_data as any;
//   //           // Handle nested config_data structure
//   //           if (parsedConfig?.config_data) {
//   //             parsedConfig = parsedConfig.config_data;
//   //           }
//   //           setConfig(parsedConfig);
//   //         }
//   //       }
//   //     )
//   //     .subscribe();

//   //   return () => {
//   //     supabase.removeChannel(channel);
//   //   };
//   // }, [village, normalizedLanguage]);

//   return { config, loading: isLoading, error };
// };
