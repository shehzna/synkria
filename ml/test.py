import numpy as np
from datetime import datetime, timedelta
from tensorflow.keras.models import load_model

model = load_model("lstm_menstrual_cycle_model.h5", compile=False)

SEQUENCE_LENGTH = 3


def calculate_cycle_lengths(periods):
    """
    periods: list of (start_date, end_date)
    returns: list of cycle lengths in days
    """
    cycle_lengths = []
    for start, end in periods:
        length = (end - start).days
        cycle_lengths.append(length)
    return cycle_lengths


def predict_next_period_date(periods):
    cycle_lengths = calculate_cycle_lengths(periods)

    if len(cycle_lengths) < SEQUENCE_LENGTH:
        return None

    last_seq = np.array(cycle_lengths[-SEQUENCE_LENGTH:])
    last_seq = last_seq.reshape((1, SEQUENCE_LENGTH, 1))

    predicted_cycle_length = model.predict(last_seq, verbose=0)[0][0]

    last_period_end = periods[-1][1]
    next_period_start = last_period_end + timedelta(days=round(predicted_cycle_length))

    return next_period_start.date(), round(predicted_cycle_length, 2)


if __name__ == "__main__":
    print("\n Enter last 3 menstrual periods")
    print("Date format: YYYY-MM-DD\n")

    periods = []

    for i in range(1, 4):
        start = input(f"Period {i} start date: ").strip()
        end = input(f"Period {i} end date: ").strip()

        try:
            start_date = datetime.strptime(start, "%Y-%m-%d")
            end_date = datetime.strptime(end, "%Y-%m-%d")

            if end_date <= start_date:
                print(" End date must be after start date")
                exit()

            periods.append((start_date, end_date))

        except ValueError:
            print(" Invalid date format. Use YYYY-MM-DD")
            exit()

    result = predict_next_period_date(periods)

    if result is None:
        print(" Not enough data to predict")
    else:
        next_date, cycle_len = result
        print("\n Predicted cycle length:", cycle_len, "days")
        print(" Predicted next period start date:", next_date)