# from flask import Flask

# app = Flask(__name__)

# @app.route('/')
# def home():
#     return "<h1>🎉 Hello Aliah! Your financial dashboard is ready!</h1>"

# if __name__ == '__main__':
#     app.run(debug=True)
# from fastapi import FastAPI
# from fastapi.responses import HTMLResponse
# import pandas as pd
# from datetime import datetime

# app = FastAPI()

# # Load data
# df = pd.read_excel('CleanedPayments.xlsx')
# df['payment_date'] = pd.to_datetime(df['payment_date'])
# df['month'] = df['payment_date'].dt.to_period('M')
# df['year'] = df['payment_date'].dt.year

# # Create Monthly Summary Table
# dashboard = df.groupby('month').agg({
#     'amount': 'sum',
#     'principal_paid': 'sum',
#     'interest_paid': 'sum'
# }).reset_index()
# dashboard['net_profit'] = dashboard['interest_paid']
# dashboard['month'] = dashboard['month'].astype(str)

# @app.get("/", response_class=HTMLResponse)
# async def read_root():
#     return """
#     <h1>Financial Dashboard</h1>
#     <p>Use the following endpoints:</p>
#     <ul>
#         <li><a href="/summary">Summary</a></li>
#         <li><a href="/risk_forecast">Risk Forecast</a></li>
#         <li><a href="/report?year=2023">Annual Report</a></li>
#         <li><a href="/report?month=2023-01">Monthly Report</a></li>
#     </ul>
#     """

# @app.get("/summary")
# async def summary():
#     total_revenue_all = df['amount'].sum()
#     total_expense_all = df['principal_paid'].sum()
#     total_net_all = df['interest_paid'].sum()
    
#     return {
#         "total_revenue": total_revenue_all,
#         "total_expenses": total_expense_all,
#         "total_net": total_net_all
#     }

# @app.get("/risk_forecast")
# async def risk_forecast():
#     projected_next_3_months = dashboard['amount'].tail(3).mean()
#     total_expected = projected_next_3_months * 3
#     total_expense = dashboard['principal_paid'].tail(3).sum()
#     safety_ratio = (total_expected - total_expense) / total_expected * 100

#     if safety_ratio >= 50:
#         risk_level = "🟢 Excellent"
#         recommendation = "استمر بنفس الأداء ووسّع نشاطك التدريجي."
#     elif 40 <= safety_ratio < 50:
#         risk_level = "🟡 Medium Risk"
#         recommendation = "قلل التكاليف التشغيلية، وراقب المصاريف بدقة."
#     else:
#         risk_level = "🔴 High Risk"
#         recommendation = "عليك بعمل خطة إنقاذ عاجلة، تقليل النفقات، ورفع الإيرادات فورًا."

#     return {
#         "projected_revenue": total_expected,
#         "safety_ratio": safety_ratio,
#         "risk_level": risk_level,
#         "recommendation": recommendation
#     }

# @app.get("/report")
# async def report(year: int = None, month: str = None):
#     if year:
#         filtered_df = df[df['payment_date'].dt.year == year]
#     elif month:
#         filtered_df = df[df['payment_date'].dt.to_period('M') == month]
#     else:
#         return {"error": "يرجى تحديد سنة أو شهر."}

#     total_revenue = filtered_df['amount'].sum()
#     total_expenses = filtered_df['principal_paid'].sum()
#     total_net = filtered_df['interest_paid'].sum()

#     return {
#         "year": year,
#         "month": month,
#         "revenue": total_revenue,
#         "expenses": total_expenses,
#         "net_profit": total_net
#     }
