from app import create_app, db
from app.models import User, Product, Category, Order, Post

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Product': Product, 'Category': Category, 'Order': Order, 'Post': Post}

if __name__ == '__main__':
    app.run(debug=True)
