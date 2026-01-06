use std::time::Instant;

use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};
use anyhow::Result;
use hound::WavReader;

fn load_wav_to_f32(path: &str) -> Result<Vec<f32>> {
    let reader = WavReader::open(path)?;
    let samples: Result<Vec<f32>, _> = reader
        .into_samples::<i16>()
        .map(|s| s.map(|sample| sample as f32 / 32768.0))
        .collect();
    Ok(samples?)
}

#[tokio::main]
async fn main() -> Result<()> {
    let model_path = "models/ggml-model.bin";
    let ctx = WhisperContext::new_with_params(model_path, WhisperContextParameters::default())?;
    let mut state = ctx.create_state()?;
    let audio: Vec<f32> = load_wav_to_f32("output.wav")?;
    let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
    params.set_n_threads(8);
    params.set_translate(false);
    params.set_print_special(false);
    params.set_language(Some("vi"));
    params.set_temperature(0.1);

    let time_now = Instant::now();
    state.full(params, &audio[..])?;

    let elapsed_time = time_now.elapsed();
    println!("time => {:?}",elapsed_time);
    let num_segments = state.full_n_segments();
    for i in 0..num_segments {
        if let Some(segment) = state.get_segment(i) {
            println!("{:?}", segment);
        }
    }
    Ok(())
}
